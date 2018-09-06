//import required packages
var inquirer = require("inquirer");
var Table = require('cli-table');
var Chalk = require("chalk");

//create an empty object to hold all the properties that is to be exported
var customer={};

//function to ask the customer if he wants to shop or quit
customer.askForShopping = function(){

    inquirer.prompt([{
        message:"What would you like to do?",
        type:"list",
        name:"action",
        choices:["Shop","Quit"]
    }]).then(function(answer){

        //If customer chooses to shop
        if(answer.action === "Shop"){

            //get all the products' information from the products table which has stock available
            customer.connection.query("SELECT * FROM products WHERE stock_quantity >0",
            function(err,res){

                if(err) throw err;

                //If no product has a positive stock or if there is no product in the table;
                //Show appropriate message and end the connection
                if(res.length === 0){
                    console.log(Chalk.red("No Products available, wait for manager to add product\n"));
                    customer.connection.end();
                }
                //If there are products in the table with positive stock
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
                    //print table
                    console.log(table.toString());

                    //Ask user for the ID of the product that he wants to buy
                    inquirer.prompt([
                    {
                        message:"What is the ID of the item you would like to purchase?",
                        name:"productID",
                        type:"input",
                        validate: function(value){
                            for(var i =0;i<value.length;i++)
                                if(isNaN(parseInt(value[i]))) return false;
                            
                            return true;
                        }
                    }]).then(function(answer){

                        //find if the table has a product with positive stock and matches the entered ID 
                        customer.connection.query("SELECT * FROM products WHERE ? AND stock_quantity > 0",
                        [{
                            product_id:parseInt(answer.productID)
                        }],
                        function(err,res){

                            if(err) throw err;

                            //If there is no product in the table with positive stock and matches the 
                            //entered ID; show message and then go back to askForShopping()
                            if(res.length === 0){
                                console.log(Chalk.red("Invalid Product ID\n"));
                                customer.askForShopping();
                            }
                            //If there is a product that matches the productID entered
                            else{

                                //ask customer for the quantity he wants to buy
                                inquirer.prompt([
                                {
                                    message:"How many would you like?",
                                    name:"quantity",
                                    type:"input",
                                    validate: function(value){
                                        for(var i =0;i<value.length;i++)
                                            if(isNaN(parseInt(value[i]))) return false;
                                        if(parseInt(value) === 0) return false;
        
                                        return true;
                                    }
                                }]).then(function(answer2){

                                    //Check if the product has enough stock to fulfil the quantity entered
                                    customer.checkForStockSufficiency(parseInt(answer.productID), parseInt(answer2.quantity));
                                });
                            }
                        });
                    });
                }
            });      
        }
        //If user chooses "quit", end the connection
        else{
            customer.connection.end();
        }
    }); 
}

//function that checks if the entered quantity <= stock available
customer.checkForStockSufficiency = function(productID,quantity){

    //find the product with the entered product IS
    customer.connection.query("SELECT * FROM products WHERE ?",
    [{
        product_id:productID
    }],function(err,res){

        if(err) throw err;

        //if stock < quantity entered, show error message and call askForShopping()
        if(res[0].stock_quantity < quantity){
            console.log(Chalk.red("Insufficient Stock: Only "+res[0].stock_quantity+" left in stock\n"));
            customer.askForShopping();
        }
        //If there is sufficient stock to fulfil the order
        else{

            //get updated stock quantity
            var updatedStock = res[0].stock_quantity - quantity;

            //get updated product sales by adding this order's amount to it
            var newProductSale = res[0].product_sales + res[0].price * quantity;

            //show the order summary
            console.log("\n================================")
            console.log("Product: "+ res[0].product_name)
            console.log("Department: "+ res[0].department_name)
            console.log("Quantity: "+ quantity);
            console.log("Price/Unit: "+ res[0].price);
            console.log("Total Price: "+ (res[0].price * quantity).toFixed(2));
            console.log("================================\n")

            //ask customer for order confirmation
            inquirer.prompt([{
                message:"Are you sure you want to place the order?",
                type:"confirm",
                name:"doBuy",
                default:false
            }]).then(function(answer){

                //if user confirms, call placeOrder()
                if(answer.doBuy)
                    customer.placeOrder(productID,quantity,updatedStock,newProductSale);
                //if user declines, go back to showing the shop/quit option
                else
                    customer.askForShopping();
            });
            
        }
    });
}

//function that updates the database upon placing the order
customer.placeOrder = function(productID, quantity, updatedStock, newProductSale){

    //update the products table; update stock and product_sales for the product
    customer.connection.query("UPDATE products SET ? WHERE ?",
    [{
        stock_quantity:updatedStock,
        product_sales:newProductSale
    },
    {
        product_id:productID
    }],
    function(err,res){

        if(err) throw err;

        //if update was successful, show order message to customer
        if(res.affectedRows === 1)
            customer.showOrderMessage(productID,quantity);
        //if update wasn't successful, show error message and go back to showing shop/quit option
        else{
            console.log(Chalk.red("Sorry! Could not place your order due to technical issue, Try again!\n"));
            customer.askForShopping();
        }
    });
}

//function that shows user the order confirmation along with the order details
customer.showOrderMessage = function(productID,quantity){

    //get the product information from the database
    customer.connection.query("SELECT product_name, price FROM products WHERE ?",
    [{
        product_id:productID
    }],
    function(err,res){

        if(err) throw err;

        //Show the order details including quantity, product name and order total;
        //then go back to showing shop/quit option
        console.log(Chalk.green.bold("Your order of "+ quantity+ " "+res[0].product_name + " was successfully placed for $"+ (res[0].price*quantity).toFixed(2)+" !!\n"))
        customer.askForShopping();
    });
}

//export customer object
module.exports = customer;