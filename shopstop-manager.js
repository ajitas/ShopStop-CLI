//import required packages
var inquirer = require("inquirer");
var Table = require('cli-table');
var Chalk = require("chalk");

//create an empty object to hold all the properties that is to be exported
var manager ={};

//function to ask the manager what he wants to do
manager.askForOptions = function(){
    inquirer.prompt([{
        message:"What would you like to do?",
        name:"action",
        choices:["View Products for sale","View low inventory","Add inventory","Add new product","Quit"],
        type:"list"
    }]).then(function(answer){
        switch(answer.action){
            case "View Products for sale":  manager.displayProducts(); 
                                            break;
            case "View low inventory":      manager.displayLowInventory();
                                            break; 
            case "Add inventory":           manager.addInventory();
                                            break;
            case "Add new product":         manager.addNewProduct();  
                                            break;
            case "Quit":                    manager.connection.end();
                                            break;
        }
    });
}

//function that displays all the products information to manager
manager.displayProducts = function(){

    //get all the products information from database
    manager.connection.query("SELECT * FROM products",
        function(err,res){

            if(err) throw err;

            //If no products are available in database, show error
            if(res.length === 0)
                console.log(Chalk.red("No Products in catalog\n"));

            //If there is information returned by the database
            else{
                    var table = new Table({
                        //get table headers
                        head: ["ID", "Product", "Department", "Price", "Stock"],
                        //get table column widths
                        colWidths: [10, 20, 15, 10, 10]
                    });
    
                    //add product information to the table
                    for (var i = 0; i < res.length; i++) {
                        table.push(
                            [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
                        );
                    }
                    //print the table
                    console.log("\n"+table.toString());
            }

            //ask the manager what he wants to do next
            manager.askForOptions();
        }
    );
}

//function that displays products to the manager that have low inventory
manager.displayLowInventory = function(){

    //get information from database about the products that have low inventory
    manager.connection.query("SELECT * FROM products WHERE stock_quantity < 5",
        function(err,res){

            if(err) throw err;

            //If no rows are returned from database, show the appropriate message
            if(res.length === 0)
                console.log(Chalk.red("No Product in catalog has low inventory\n"));

            //If there are products in database that have low inventory
            else{
                    var table = new Table({
                        //table headers
                        head: ["ID", "Product", "Department", "Price", "Stock"],
                        //column widths
                        colWidths: [10, 20, 15, 10, 10]
                    });
    
                    //add product information to the table
                    for (var i = 0; i < res.length; i++) {
                        table.push(
                            [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
                        );
                    }
                    //print the table
                    console.log("\n"+table.toString());
            }

            //ask the manager what he wants to do next 
            manager.askForOptions();
        }
    );
}

//Asks manager about the new product's details that he wants to add
manager.addNewProduct = function(){

    //get all the products from the database
    manager.connection.query("SELECT * FROM products",function(err,res){
        if(err) throw err;

        //If no rows returned, show message and go back to showing options of what to do next
        if(res.length === 0){
            console.log(Chalk.red("No product exists yet\n"));
        }
        //if row(s) are returned
        else{
            var table = new Table({
                //table headers
                head: ["ID", "Product", "Department", "Price", "Stock"],
                //column widths
                colWidths: [10, 20, 15, 10, 10]
            });

            //add product information to the table
            for (var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
                );
            }
            //print the table
            console.log("\n"+table.toString());
        }
        //get all the departments name from database
        manager.connection.query("SELECT department_name FROM departments", function(err,res2){
            if(err) throw err;

            //array to hold all the department names from the database
            var departmentArray = [];

            //If no department exists, asks the manager to wait till the supervisor 
            //adds a new department to database
            if(res2.length === 0){
                console.log(Chalk.red("No department exists yet, wait for supervisor to add new department\n"));
                manager.askForOptions();
            }
            //add all the department names to the array
            for(var i =0;i<res2.length;i++)
                departmentArray.push(res2[i].department_name);

            //ask the manager about the new product he wants to add
            inquirer.prompt([{
                message:"Which Product would you like to add?",
                name:"product_name",
                type:"input",
                validate: function(value){
                    for(var i =0;i<res.length;i++){
                        if(value.toLowerCase() === res[i].product_name.toLowerCase())
                            return false;
                    }
                    return true;
                }
            },
            {
                message:"Which category would you like to add it to?",
                name:"department",
                type:"list",
                choices:departmentArray
            },
            {
                message:"How much does it cost?",
                name:"price",
                type:"input",
                validate: function(value){
                    var decimalPlace = value.indexOf(".");
                    //if there is no decimal, then all the characters should be integer
                    if(decimalPlace === -1){
                        for(var i =0;i<value.length;i++)
                            if(isNaN(parseInt(value[i]))) 
                                return false;
                    }
                    //if there is a decimal, then the part before and after should have all characters as digit
                    else{
                        var integerPart = value.slice(0,decimalPlace);
                        var decimalPart = value.slice(decimalPlace+1)
                        //if we have more than 2 digits after decimal
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
            },
            {
                message:"How many do we have?",
                name:"stock",
                type:"input",
                validate: function(value){
                    for(var i =0;i<value.length;i++)
                        if(isNaN(parseInt(value[i]))) return false;
                    return true;
                }
            }]).then(function(answer){
                    
                //display the information before asking manager for confirmation to add new product
                console.log("================================")
                console.log("Product: "+ answer.product_name)
                console.log("Department: "+ answer.department)
                console.log("Price: "+ parseFloat(answer.price).toFixed(2))
                console.log("Stock: "+ parseInt(answer.stock));
                console.log("================================\n")

                //ask the manager for confirmation to add new product to database
                inquirer.prompt([{
                    message:"Are you sure you want to add the product?",
                    type:"confirm",
                    name:"doAdd",
                    default:false
                }]).then(function(answer2){

                    //if manager confirms positively, insert the information into database
                    if(answer2.doAdd)
                        manager.insertNewProductToDatabase(answer.product_name.toLowerCase(),answer.department, parseFloat(answer.price).toFixed(2), parseInt(answer.stock));
                    //If manager confrims negatively, go back to showing options of what he wants to do
                    else
                        manager.askForOptions();
                }); 
            });
        });
    });
}

//inserts the details of new product to database
manager.insertNewProductToDatabase = function(product_name, department, price, stock){

    manager.connection.query("INSERT INTO products SET ?",
        [{
            product_name:product_name,
            department_name:department,
            price:price,
            stock_quantity:stock
        }],function(err,res){
            if(err) throw err;

            //show the confirmation message to the manager and go back to showing him options of what to do next
            console.log(Chalk.green.bold("Product "+product_name + " added to ShopStop!!\n"));
            manager.askForOptions();
        });
}

//function to add inventory to an existing product
manager.addInventory = function(){

    //get all the products from the database
    manager.connection.query("SELECT * FROM products",function(err,res){

        if(err) throw err;

        //if no product exists in the database, show message and return to showing options of what to do next
        if(res.length === 0){
            console.log(Chalk.red("No Products in catalog, Select Add a Product\n"));
            manager.askForOptions();
        }
        //If there are products existing in the database
        else{
            var table = new Table({
                //table headers
                head: ["ID", "Product", "Department", "Price", "Stock"],
                //table column widths
                colWidths: [10, 20, 15, 10, 10]
            });
        
            // add products information to the table
            for (var i = 0; i < res.length; i++) {
                table.push(
                    [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
                );
            }
            //print the table
            console.log(table.toString());

            //asks the manager about the ID of the existing product that he wants to add inventory for
            inquirer.prompt([
            {
                message:"What is the ID of the item you would like to add inventory for?",
                name:"productID",
                type:"input",
                validate: function(value){
                    for(var i =0;i<value.length;i++)
                        if(isNaN(parseInt(value[i]))) return false;
                    
                    return true;
                }
            }]).then(function(answer){

                //get the product details of the selected product that the manager wants to add inventory for
                manager.connection.query("SELECT * FROM products WHERE ? ",
                [{
                    product_id:parseInt(answer.productID)
                }],
                function(err,res){

                    if(err) throw err;

                    //if no data is returned, means no such product exists that matches with product ID given 
                    //by the manager; show the message and then go back to showing options of what to do next
                    if(res.length === 0){
                        console.log(Chalk.red("Invalid Product ID\n"));
                        manager.askForOptions();
                    }
                    //If such product is found in the database
                    else{

                        //ask the manager how much inventory he wants to add
                        inquirer.prompt([
                        {
                            message:"How many would you like to add?",
                            name:"quantity",
                            type:"input",
                            validate: function(value){
                                for(var i =0;i<value.length;i++)
                                    if(isNaN(parseInt(value[i]))) return false;
                                if(parseInt(value) === 0) return false;

                                return true;
                            }
                        }]).then(function(answer2){

                            //show message to the manager and ask for confirmation
                            console.log("================================")
                            console.log("Product: "+ res[0].product_name)
                            console.log("Added Inventory: "+ parseInt(answer2.quantity));
                            console.log("================================\n")

                            inquirer.prompt([{
                                message:"Are you sure you want to add the inventory?",
                                name:"doAdd",
                                type:"confirm",
                                default:false
                            }]).then(function(answer3){

                                //if manager responds positively
                                if(answer3.doAdd)
                                    //update the inventory in database for that product
                                    manager.updateInventoryInDatabase(parseInt(answer.productID),res[0].product_name, res[0].stock_quantity + parseInt(answer2.quantity),parseInt(answer2.quantity) );
                                //If manager responds negatively, show the options of what to do next
                                else
                                    manager.askForOptions();
                            }); 
                        });
                    }
                });
            });
        }
    }); 
}


//function that updates the new inventory to the database
manager.updateInventoryInDatabase = function(product_id,product_name, newStock, addedStock){
    manager.connection.query("UPDATE products SET ? WHERE ?",
    [{
        stock_quantity:newStock
    },
    {
        product_id:product_id
    }],
    function(err, res){
        if(err) throw err;

        //Show the confirmation message to the manager and go back to showing options of what to do next
        console.log(Chalk.green.bold(addedStock+" " +product_name +" added to inventory!!!\n"));
        manager.askForOptions();
    });
}

//export manager object
module.exports = manager;
