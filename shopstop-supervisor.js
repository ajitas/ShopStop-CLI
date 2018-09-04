//import required packages
var inquirer = require("inquirer");
var Table = require('cli-table');
var Chalk = require("chalk");

//create an empty object to hold all the properties that is to be exported
var supervisor = {};

//function that displays all the product details including their sales information
supervisor.displayProducts = function(){

    //get all the products details from the database
    supervisor.connection.query("SELECT * FROM products",function(err,res){

        if(err) throw err;

        //If no rows are returned, show appropriate message to the supervisor
        //and display options of what he wants to do next
        if(res.length === 0){
            console.log(Chalk.red("No Products in catalog\n"));
            supervisor.askForOptions();
        }
        //If row(s) are returned from database
        else{
            var table = new Table({
                //table headers
                head: ["ID", "Product", "Department", "Price", "Stock","Product Sale"],
                //column widths
                colWidths: [10, 20, 15, 10, 10,20]
            });
        
            //add product information to the table
            for (var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity, res[i].product_sales],
                );
            }
            //diaply the table
            console.log(table.toString());
            //go back to showing the supervisor options of what to do next
            supervisor.askForOptions();
        }
    });
}

//function to ask the supervisor what he wants to do
supervisor.askForOptions = function(){
    inquirer.prompt([{
        message:"What would you like to do?",
        name:"action",
        choices:["View Product sales by department","Add new department","Quit"],
        type:"list"
    }]).then(function(answer){
        switch(answer.action){
            case "View Product sales by department":
                                            supervisor.displayProductSalesByDepartment(); 
                                            break;
            case "Add new department":      supervisor.addNewDepartment();
                                            break;
            case "Quit":                    supervisor.connection.end();
                                            break;
        }
    });
}

//displays the product sales and profit for each department
supervisor.displayProductSalesByDepartment = function(){

    var query = "SELECT department_id,departments.department_name,over_head_costs,CASE WHEN sum(product_sales) IS NULL THEN 0 ELSE sum(product_sales) END AS total_product_sales,CASE WHEN sum(product_sales) IS NULL THEN 0 ELSE sum(product_sales) END - over_head_costs AS total_profit";
    query+= " FROM products RIGHT OUTER JOIN departments";
    query+= " ON departments.department_name = products.department_name";
    query+= " GROUP BY departments.department_name,department_id,over_head_costs";

    supervisor.connection.query(query,function(err,res){
        if(err) throw err;

        //If no rows are returned, show appropriate message and show options of what to do next
        if(res.length === 0){
            console.log(Chalk.red("No department exists yet, select Add a department\n"))
            supervisor.askForOptions();
        }
        //IF row(s) are returned
        else{
            var table = new Table({
                //table headers
                head: ["Department ID", "Department Name", "Over Head Costs", "Product Sales ", "Profit"],
                //column widths
                colWidths: [15, 20, 20, 17, 15]
            });

            //add the required information to the table
            for (var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].total_product_sales, res[i].total_profit],
                );
            }

            //display the table
            console.log("\n"+table.toString());
            //ask the supervisor what he wants to do next
            supervisor.askForOptions();
        }
    });
}

//function to add a new department
supervisor.addNewDepartment = function(){

    //get all the departments from teh database
    supervisor.connection.query("SELECT * FROM departments",function(err,res){
        if(err) throw err;

        //If no rows returned, show message and go back to showing options of what to do next
        if(res.length === 0){
            console.log(Chalk.red("No department exists yet\n"));
        }
        //if row(s) are returned
        else{
            var table = new Table({
                //table header
                head: ["Department ID", "Department Name", "Over Head Costs"],
                //column widths
                colWidths: [15, 20, 20]
            });

            //add departments information to the table
            for (var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].department_id, res[i].department_name, res[i].over_head_costs],
                );
            }
            //print the table
            console.log("\n"+table.toString());
        }

        //ask the supervisor about the new department he wants to add
        inquirer.prompt([{
            message:"Which Department would you like to add?",
            name:"department_name",
            type:"input",
            validate: function(value){
                for(var i =0;i<res.length;i++){
                    if(value.toLowerCase() === res[i].department_name.toLowerCase())
                        return false;
                }
                return true;
            }
        },
        {
            message:"Overhead cost of the new department?",
            name:"overhead_cost",
            type:"input",
            validate: function(value){
                var decimalPlace = value.indexOf(".");
                if(decimalPlace === -1){
                    for(var i =0;i<value.length;i++)
                        if(isNaN(parseInt(value[i]))) 
                            return false;
                }
                else{
                    var integerPart = value.slice(0,decimalPlace);
                    var decimalPart = value.slice(decimalPlace+1)
                    if(decimalPart.length>2)
                        return false;
                    for(var i =0;i<integerPart.length;i++)
                        if(isNaN(parseInt(integerPart[i]))) 
                            return false;
                    for(var i =0;i<decimalPart.length;i++)
                        if(isNaN(parseInt(decimalPart[i]))) 
                            return false;
                }
                return true;
            }
        }]).then(function(answer){

            //show summary to supervisor and ask for confirmation to add to database
            console.log("================================")
            console.log("Department: "+ answer.department_name)
            console.log("Over Head Cost: "+ parseFloat(answer.overhead_cost))
            console.log("================================\n")

            inquirer.prompt([{
                message:"Are you sure you want to add the department?",
                type:"confirm",
                name:"doAdd",
                default:false
            }]).then(function(answer2){

                //if supervisor responds positively, insert the new information in the database
                if(answer2.doAdd)
                    supervisor.insertNewDepartmentInDatabase(answer.department_name.toLowerCase(), answer.overhead_cost);
                //If supervisor responds negatively, go back to showing options of what to do next
                else
                    supervisor.askForOptions();
            });
        });
    }); 
}

//insert the new department information in the database
supervisor.insertNewDepartmentInDatabase = function(department_name, overhead_cost){
    supervisor.connection.query("INSERT INTO departments SET ?",
    [{
        department_name:department_name,
        over_head_costs:overhead_cost
    }],function(err,res){
        if(err) throw err;

        //show the confirmation message to the supervisor, then show options of what to do next
        console.log(Chalk.green.bold("Department "+department_name + " added to ShopStop!!\n"));
        supervisor.askForOptions();
    });
}

//export supervisor object
module.exports = supervisor;



