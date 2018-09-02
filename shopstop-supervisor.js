var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "shopstop_db"
});
connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
});

function displayProducts(){
    connection.query("select * from products",
            function(err,res){

                if(err) throw err;

                if(res.length === 0)
                    console.log("No Products in catalog");
                else{
                    var table = new Table({
                        //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
                        head: ["ID", "Product", "Department", "Price", "Stock","Product Sale"],
                        //These are just the width of the columns. Only mess with these if you want to change the cosmetics of our response
                        colWidths: [10, 20, 15, 10, 10,20]
                    });
                
                    // table is an Array, so you can `push`, `unshift`, `splice`
                    for (var i = 0; i < res.length; i++) {
                        table.push(
                            [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity, res[i].product_sales],
                        );
                    }
                    console.log(table.toString());
                    askForOptions();
                }
            });
}
function askForOptions(){
    inquirer.prompt([{
        message:"What would you like to do?",
        name:"action",
        choices:["View Product sales by department","Add new department","Quit"],
        type:"list"
    }]).then(function(answer){
        switch(answer.action){
            case "View Product sales by department":
                                            displayProductSalesByDepartment(); 
                                            break;
            case "Add new department":      addNewDepartment();
                                            break;
            case "Quit":                    connection.end();
                                            break;
        }
    });
}

function displayProductSalesByDepartment(){
    var query = "select department_id,departments.department_name,over_head_costs,sum(product_sales) AS total_product_sales,sum(product_sales)-over_head_costs AS total_profit";
    query+= " from products inner join departments";
    query+= " on departments.department_name = products.department_name";
    query+= " group by departments.department_name,department_id,over_head_costs";
    connection.query(query,function(err,res){
        if(err) throw err;

        var table = new Table({
            //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
            head: ["Department ID", "Department Name", "Over Head Costs", "Product Sales ", "Total Profit"],
            //These are just the width of the columns. Only mess with these if you want to change the cosmetics of our response
            colWidths: [15, 20, 20, 17, 15]
        });

        //table is an Array, so you can `push`, `unshift`, `splice`
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].total_product_sales, res[i].total_profit],
            );
        }
        console.log("\n"+table.toString());

        askForOptions();

    });

}

function addNewDepartment(){
    connection.query("select * from departments",function(err,res){
        if(err) throw err;

        var table = new Table({
            //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
            head: ["Department ID", "Department Name", "Over Head Costs"],
            //These are just the width of the columns. Only mess with these if you want to change the cosmetics of our response
            colWidths: [15, 20, 20]
        });

        //table is an Array, so you can `push`, `unshift`, `splice`
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].department_id, res[i].department_name, res[i].over_head_costs],
            );
        }
        console.log("\n"+table.toString());

        inquirer.prompt([{
            message:"Which Department would you like to add?",
            name:"department_name",
            type:"input"
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
            inquirer.prompt([{
                message:"Are you sure you want to add the department?",
                type:"confirm",
                name:"doAdd",
                default:false
            }]).then(function(answer2){
                if(answer2.doAdd)
                    insertNewDepartmentInDatabase(answer.department_name, answer.overhead_cost);
                else
                    askForOptions();
            });
            
        });

    });
    
}


function insertNewDepartmentInDatabase(department_name, overhead_cost){
    connection.query("insert into departments set ?",
    [{
        department_name:department_name,
        over_head_costs:overhead_cost
    }],function(err,res){
        if(err) throw err;
        console.log(department_name + " added to ShopStop!!\n")
        askForOptions();
    });
}



