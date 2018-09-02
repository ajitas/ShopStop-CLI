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
    askForShopping();
});

function askForShopping(){
    console.log("\n");
    inquirer.prompt([{
        message:"Would you like to shop?",
        type:"confirm",
        name:"doShop",
        default:true
    }]).then(function(answer){
        if(answer.doShop){
            connection.query("select * from products where stock_quantity >0",
            function(err,res){

                if(err) throw err;

                if(res.length === 0){
                    console.log(Chalk.red("No Products in catalog, wait for manager to add new product"));
                    connection.end();
                }
                else{
                    var table = new Table({
                        //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
                        head: ["ID", "Product", "Department", "Price", "Stock"],
                        //These are just the width of the columns. Only mess with these if you want to change the cosmetics of our response
                        colWidths: [10, 20, 15, 10, 10]
                    });
                
                    // table is an Array, so you can `push`, `unshift`, `splice`
                    for (var i = 0; i < res.length; i++) {
                        table.push(
                            [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
                        );
                    }
                    console.log(table.toString());

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
                        connection.query("select * from products where ? and stock_quantity > 0",
                        [{
                            product_id:parseInt(answer.productID)
                        }],
                        function(err,res){

                            if(err) throw err;

                            if(res.length === 0){
                                console.log(Chalk.red("Invalid Product ID"));
                                askForShopping();
                            }
                            else{
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
                                    checkForStockSufficiency(parseInt(answer.productID), parseInt(answer2.quantity));
                                });
                            }
                        });
                    });
                }
            });      
        }
        else
            connection.end();
    }); 
}

function checkForStockSufficiency(productID,quantity){
    connection.query("select * from products where ?",
    [{
        product_id:productID
    }],function(err,res){

        if(err) throw err;

        if(res.length === 0){
            console.log(Chalk.red("Invalid Product ID"));
            askForShopping();
        }
        else{
            if(res[0].stock_quantity < quantity){
                console.log(Chalk.red("Insufficient Stock: Only "+res[0].stock_quantity+" left in stock"));
                askForShopping();
            }
            else{
                var updatedStock = res[0].stock_quantity - quantity;
                var newProductSale = res[0].product_sales + res[0].price * quantity;
                console.log("================================")
                console.log("Product: "+ res[0].product_name)
                console.log("Department: "+ res[0].department_name)
                console.log("Total Price: "+ (res[0].price * quantity).toFixed(2));
                console.log("================================")

                inquirer.prompt([{
                    message:"Are you sure you want to place the order?",
                    type:"confirm",
                    name:"doBuy",
                    default:false
                }]).then(function(answer){
                    if(answer.doBuy)
                        placeOrder(productID,quantity,updatedStock,newProductSale);
                    else
                        askForShopping();
                });
                
            }
        }
    });
}

function placeOrder(productID, quantity, updatedStock, newProductSale){
    connection.query("update products set ? where ?",
    [{
        stock_quantity:updatedStock,
        product_sales:newProductSale
    },
    {
        product_id:productID
    }],function(err,res){
        if(err) throw err;
        if(res.affectedRows === 1)
            showOrderMessage(productID,quantity);
        else{
            console.log(Chalk.red("Sorry! Could not place your order due to technical issue, Try again!"));
            askForShopping();
        }
    });
}

function showOrderMessage(productID,quantity){
    connection.query("select product_name, price from products where ?",
    [{
        product_id:productID
    }],
    function(err,res){
        if(err) throw err;
        console.log(Chalk.green.bold("Your order of "+ quantity+ " "+res[0].product_name + " was successfully placed for $"+ (res[0].price*quantity).toFixed(2)+" !!"))
        askForShopping();
    });
}