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
    askForOptions();
});

function askForOptions(){
    inquirer.prompt([{
        message:"What would you like to do?",
        name:"action",
        choices:["View Products for sale","View low inventory","Add inventory","Add new product","Quit"],
        type:"list"
    }]).then(function(answer){
        switch(answer.action){
            case "View Products for sale":  displayProducts(); 
                                            break;
            case "View low inventory":      displayLowInventory();
                                            break; 
            case "Add inventory":           addInventory();
                                            break;
            case "Add new product":         addNewProduct();  
                                            break;
            case "Quit":                    connection.end();
                                            break;
        }
    });
}

function displayProducts(){
    connection.query("select * from products",
                    function(err,res){

                        if(err) throw err;

                        if(res.length === 0)
                            console.log("No Products in catalog");
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
                                console.log("\n"+table.toString());
                            }
                            askForOptions();
                    });
}

function displayLowInventory(){
    connection.query("select * from products where stock_quantity < 5",
                    function(err,res){

                        if(err) throw err;

                        if(res.length === 0)
                            console.log("No Products in catalog");
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
                                console.log("\n"+table.toString());
                            }
                            askForOptions();
                    });

}

function addNewProduct(){
    inquirer.prompt([{
        message:"Which Item would you like to add?",
        name:"product_name",
        type:"input"
    }]).then(function(answer){
        getNewProductDetails(answer.product_name);
    });
}
function getNewProductDetails(product_name){
    connection.query("select department_name from products group by department_name", function(err,res){
        if(err) throw err;
        var departmentArray = [];
        for(var i =0;i<res.length;i++)
            departmentArray.push(res[i].department_name);

        inquirer.prompt([{
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
            console.log("Product: "+ product_name)
            console.log("Department: "+ answer.department)
            console.log("Price: "+ parseFloat(answer.price).toFixed(2))
            console.log("Stock: "+ parseInt(answer.stock));

            inquirer.prompt([{
                message:"Are you sure you want to add the product?",
                type:"confirm",
                name:"doAdd",
                default:false
            }]).then(function(answer2){
                if(answer2.doAdd)
                    insertNewProductToDatabase(product_name,answer.department, parseFloat(answer.price).toFixed(2), parseInt(answer.stock));
                else
                    askForOptions();
            });
        });
    });
}

function insertNewProductToDatabase(product_name, department, price, stock){
    connection.query("insert into products set ?",
                    [{
                        product_name:product_name,
                        department_name:department,
                        price:price,
                        stock_quantity:stock
                    }],function(err,res){
                        if(err) throw err;
                        console.log(product_name + " added to ShopStop!!\n")
                        askForOptions();
                    });
}

function addInventory(){
    connection.query("select * from products",
            function(err,res){

                if(err) throw err;

                if(res.length === 0)
                    console.log("No Products in catalog, Select Add a Product");
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
                        message:"What is the ID of the item you would like to add inventory for?",
                        name:"productID",
                        type:"input",
                        validate: function(value){
                            for(var i =0;i<value.length;i++)
                                if(isNaN(parseInt(value[i]))) return false;
                            
                            return true;
                        }
                    }]).then(function(answer){
                        connection.query("select * from products where ? ",
                        [{
                            product_id:parseInt(answer.productID)
                        }],
                        function(err,res){

                            if(err) throw err;

                            if(res.length === 0){
                                console.log("Invalid Product ID");
                                askForOptions();
                            }
                            else{
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
                                    inquirer.prompt([{
                                        message:"Are you sure you want to add the inventory?",
                                        name:"doAdd",
                                        type:"confirm",
                                        default:false
                                    }]).then(function(answer3){
                                        if(answer3.doAdd)
                                            updateInventoryInDatabase(parseInt(answer.productID),res[0].product_name, res[0].stock_quantity + parseInt(answer2.quantity),parseInt(answer2.quantity) );
                                        else
                                            askForOptions();
                                    }); 
                                });
                            }
                        });
                    });
                }
            }); 
}

function updateInventoryInDatabase(product_id,product_name, newStock, addedStock){
    connection.query("update products set ? where ?",
    [{
        stock_quantity:newStock
    },
    {
        product_id:product_id
    }],
    function(err, res){
        if(err) throw err;
        console.log(addedStock+" " +product_name +" added to inventory!!!");
        askForOptions();
    });
}

