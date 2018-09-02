var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var Chalk = require("chalk");
var CFonts = require("cfonts");

//usinf cfonts, the game heading is styled and displayed on terminal
CFonts.say('SHOPSTOP', {
    font: 'chrome',                  // define the font face
    align: 'center',                // define text alignment
    colors: ['cyan','blueBright'],  // define all colors
    background: 'transparent',      // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,               // define letter spacing
    lineHeight: 1,                  // define the line height
    space: false,                    // define if the output text should have empty lines on top and on the bottom
    maxLength: 20,                  // define how many character can be on one line
});
CFonts.say('===========', {
    font: 'chrome',                  // define the font face
    align: 'center',                // define text alignment
    colors: [,'blueBright'],  // define all colors
    background: 'transparent',      // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,               // define letter spacing
    lineHeight: 1,                  // define the line height
    space: false,                    // define if the output text should have empty lines on top and on the bottom
    maxLength: 20,                  // define how many character can be on one line
});

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

                if(res.length === 0){
                    console.log(Chalk.red("No Products in catalog"));
                    askForOptions();
                }
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
    console.log("\n")
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
    var query = "select department_id,departments.department_name,over_head_costs,case when sum(product_sales) is null then 0 else sum(product_sales) end AS total_product_sales,case when sum(product_sales) is null then 0 else sum(product_sales) end - over_head_costs AS total_profit";
    query+= " from products right outer join departments";
    query+= " on departments.department_name = products.department_name";
    query+= " group by departments.department_name,department_id,over_head_costs";
    connection.query(query,function(err,res){
        if(err) throw err;

        if(res.length === 0){
            console.log(Chalk.red("No department exists yet, select Add a department"))
            askForOptions();
        }
        else{
            var table = new Table({
                //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
                head: ["Department ID", "Department Name", "Over Head Costs", "Product Sales ", "Profit"],
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
        }

    });

}

function addNewDepartment(){
    connection.query("select * from departments",function(err,res){
        if(err) throw err;

        if(res.length === 0){
            console.log(Chalk.red("No department exists yet"));
        }
        else{
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
        }
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
            console.log("================================")
            console.log("Department: "+ answer.department_name)
            console.log("Over Head Cost: "+ parseFloat(answer.overhead_cost))
            console.log("================================")

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
        console.log(Chalk.green.bold("Department "+department_name + " added to ShopStop!!\n"));
        askForOptions();
    });
}



