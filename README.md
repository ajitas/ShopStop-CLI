# ShopStop-CLI

## About
ShopStop is a command line interface using mysql and node.js for customers, managers and supervisors of the store. It is a storefront that lets customers place their orders while keeping a track of the inventory. It lets managers see/update inventory or add new products. Supervisors can analyse the profit of each department and also add new departments. To run the application as a manager or supervisor, it takes an ID and password to authenticate the employee.

## Application Preview

### Customer
![ShopStop-CLI-Customer](shopstop-customer.gif)

### Manager
![ShopStop-CLI-Manager](shopstop-manager.gif)

### Supervisor
![ShopStop-CLI-Supervisor](shopstop-supervisor.gif)

## Technologies used
1. Node.js
2. MySQL

## Commands it takes
1. Customer
    * "Shop" : Customer can see a list of products available in the store along with their IDs, prices, departments and stock available. They can provide the ID of the product they want to buy followed by the quantity they want. If there is enough stock available to fulfil their order, the customer sees an order summary and once they confirm, the order is placed and the database gets updated.
    * "Quit" : The application exits execution.

2. Manager
    * If user chooses to run the application as a manager, his managerID and password is required. 
    (It can be found in managers table. One can also see it in seeds.sql file)
    * "View Products for sale" : Displays a list of products available in the store along with their IDs, prices, departments and stock available.
    * "View low inventory" : Displays a list of products in the store that have low inventory (less than 5), along with their IDs, prices, departments and stock available.
    * "Add inventory" : Takes the ID of the product that manager wants to add inventory for. It then asks how many items does the manager want to add. Once all the validation is done, a summary is shown to manager. Once he confirms, the new inventory is reflected in the database.
    * "Add new product" : Takes product name, department, price per unit and stock available from the manager. After validation, a summary is shown to the manager. Once he confirms, the new product details is added to the database.
    * "Quit" : The application exits execution.

3. Supervisor
    * If user chooses to run the application as a supervisor, his supervisorID and password is required. 
    (It can be found in supervisors table. One can also see it in seeds.sql file)
    * "View Product sales by department" : Supervisor can see product sales and profit for each department.
    * "Add new department" : Takes department name and its over head cost from the supervisor. A summary of information is shown to the supervisor and once he confirms, the new department information is added to the database.
    * "Quit" : The application exits execution.

4. Quit
    * The application exits execution.

## Mysql Tables
### products:

Column Name  | Type
------------ | -------------
product_id (Primary key) | INTEGER AUTO_INCREMENT NOT NULL
product_name | VARCHAR(50) NOT NULL
department_name | VARCHAR(30) NOT NULL
price | DECIMAL(10,2) NOT NULL
stock_quantity | INTEGER NOT NULL
product_sales | DECIMAL(10,2) DEAFULT 0

### departments:

Column Name  | Type
------------ | -------------
department_id (Primary key) | INTEGER AUTO_INCREMENT NOT NULL
department_name | VARCHAR(30) NOT NULL
over_head_costs | DECIMAL(10,2) NOT NULL

### managers:

Column Name  | Type
------------ | -------------
manager_id (Primary key) | INTEGER AUTO_INCREMENT NOT NULL
manager_name | VARCHAR(100) NOT NULL
manager_pwd | VARCHAR(20) NOT NULL

### supervisors:

Column Name  | Type
------------ | -------------
supervisor_id (Primary key) | INTEGER AUTO_INCREMENT NOT NULL
supervisor_name | VARCHAR(100) NOT NULL
supervisor_pwd | VARCHAR(20) NOT NULL

## Node Packages used
1. inquirer
    * usage
    ```require("inquirer")```
    * inquirer package makes the application interactive. It lets the user input the parameter, choose from a list, or confirm with a 'y' or 'n' by showing an appropriate message on the screen.
    * For more information: [inquirer](https://github.com/SBoudrias/Inquirer.js/)

2. mysql
    * usage
    ```require("mysql")```
    * A node package that is used to connect to mysql server and thus allows us to run queries on database tables; It also aloows us to delete, update or insert into the database tables.
    * For more information: [mysql](https://www.npmjs.com/package/mysql)

3. cfonts
    * usage
    ```require("cfonts")```
    * This package lets us style the fonts on terminal. The title "HANGMAN" on terminal uses cfonts for a wondeful looking heading.
    * For more information : [cfonts](https://www.npmjs.com/package/cfonts)

4. chalk
    * usage
    ```require("chalk")```
    * This package lets us style the fonts on terminal. It gives options for changing color of the text, backgroundcolor of the text, make the text bold and many more functionalities.
    * For more information : [chalk](https://www.npmjs.com/package/chalk)

5. cli-table
    * usage
    ```require("cli-table")```
    * It allows us to display information on the terminal in a table format.
    * For more information : [cli-table](https://www.npmjs.com/package/cli-table)

## Inquirer interaction
The application will keep running as long as "Quit" is selected from the list at any stage. Once the user starts running the application taking a role of either customer, manager or supervisor, he can't change the role without exiting the application. To use the application as Manager or Supervisor, user needs to provide ID and password to the inquirer (It can be found in managers and supervisors tables. One can also see it in seeds.sql file)

## Execution steps
1. Make sure node is installed on your machine. You can visit the website [Node Installation](http://blog.teamtreehouse.com/install-node-js-npm-mac) for instructions.
2. Download/Clone the respository.
3. Navigate on terminal to the ShopStop-CLI. Inside the folder, type "npm install". This will take all dependencies from package.json and install all the required packages to run the application.
4. Make sure mysql is installed on the localhost/other server. 
5. Log into mysql workbench and execute schema.sql followed by seeds.sql from the repository.
6. Open shopstop.js and change createConnection function's parameter in all 3 places. Replace the configuartion keys with your values.
7. Inside ShopStop-CLI folder on terminal, type "node shopstop.js" on terminal. This will start application execution. To use the application as Manager or Supervisor, user needs to provide ID and password that can be found in managers and supervisors tables. One can also see it in seeds.sql file.

## Code snippets
### Customer
1. ProductID validation
```
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
```
The above code checks if the productID entered by the customer is valid or not. It selects the row from the database table where productID matches with that given by the customer and for which stock is positive. If the productID is valid, it then checks whether the shop has enough stock of that product to fulfil the order.

2. Check for sufficient stock
```
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
```
Here, the stock quantity of the requested product is extracted from the database and then compared against the quantity requested by the customer. If the stock is less than the requested quantity, error is shown, else order is placed after customer confirmation. Thus, updating the database table for new available stock and product sales.

3. Update inventory and product sales
```
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
```
Once update has been done successfully to the database, show the order cofirmation message to the customer.

### Manager
1. ManagerID validation
```
inquirer.prompt([
{
    message:"Enter your Manager ID",
    name:"ManagerID",
    type:"input"
}
]).then(function(answer){

    //check if the managerID is present in the database or not
    Manager.connection.query("SELECT * FROM managers WHERE ?",
    {
        manager_id:parseInt(answer.ManagerID)
    },
    function(err,res){

        //if managerID is not present in the database table; end the connection and ask for ID again
        if(res.length === 0){
            console.log(Chalk.red("Invalid ID"))
```
The above code snippet shows how manager's ID is getting validated by the database query result.

2. Manager password validation
```
//If managerID is found in the database table, ask for the password
else{
    inquirer.prompt([{
        message:"Enter your password",
        name:"manager_password",
        type:"password",
        mask:"*"
    }]).then(function(answer2){

        //If password matches the password in the database, show welcome message and
        //then show manager options to user for choosing option
        if(res[0].manager_pwd === answer2.manager_password){
            console.log(Chalk.blue.bold("\n******************"))
            console.log(Chalk.blue.bold("Welcome "+ res[0].manager_name+"!!"))
            console.log(Chalk.blue.bold("******************\n"))
            Manager.askForOptions();
        }
        //If password does not match the one stored in database, show Incorrect password message
        //end the connection and go back to askForRole method
        else{
            console.log(Chalk.red("Incorrect Password"))
```
If managerID is valid and exists in database table managers, ask for the password and then match it with the password stored in the managers table. If it matches, show welcome message to the manager with his name else show an error message. If manager is able to log in successfully, show him the manager options.

3. Extract products with low inventory
```
//get information from database about the products that have low inventory
manager.connection.query("SELECT * FROM products WHERE stock_quantity < 5",
    function(err,res){

        if(err) throw err;

        //If no rows are returned from database, show the appropriate message
        if(res.length === 0)
            console.log(Chalk.red("No Product in catalog has low inventory\n"));
```
Here we are extracting only those products from the products table where stock quantity is less than 5

4. Product ID validation for adding inventory
```
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
```
To add inventory for an existing product, manager inputs the productIS and it is then validated using products table data.

5. Input the Inventory quantity to be added
```
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

```
If the productID given by managre to add inventory for is valid, then ask manager how many items does he want to add. Then it shows a summary to the manager and asks for confirmation. 

6. Updating Inventory
```
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
```
If the manager confirms positively, it goes ahead and updates the stock quantity for that product in products table in database.

7. Getting inputs for adding new product
```
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
```
Above code snippet first gets all the departnames from the departments table and pushes the department names in an array. It then starts asking manager about the new product's details. It asks about ProductID, department name which is chosen from a list of department names (i.e the array we created earlier), cost of the product per unit, and the inventory available for that product. Once all the inputs are taken from the manager, a summary is shown to the manager and manager is asked for confirmation to add new product.

8. Inserting new product in products table
```
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
```
Once the manager confirms positively to add new product, the details are inserted in products table.

### Supervisor
1. SupervisorID validation
```
//once connected ask the supervisor to enter his ID
inquirer.prompt([
    {
        message:"Enter your Supervisor ID",
        name:"SupervisorID",
        type:"input"
    }
]).then(function(answer){

    //check if the supervisorID is present in the database or not
    Supervisor.connection.query("SELECT * FROM supervisors WHERE ?",
    {
        supervisor_id:parseInt(answer.SupervisorID)
    },
    function(err,res){

        //if supervisorID is not present in the database table; end the connection and ask for ID again
        if(res.length === 0){
            console.log(Chalk.red("Invalid ID"))
```
The above code snippet shows how supervisor's ID is getting validated by the database query result.

2. Supervisor password validation
```
//If supervisorID is found in the database table, ask for the password
else{
    inquirer.prompt([{
        message:"Enter your password",
        name:"supervisor_password",
        type:"password",
        mask:"*"
    }]).then(function(answer2){

        //If password matches the password in the database, show welcome message and
        //then show supervisor options to user for choosing option
        if(res[0].supervisor_pwd === answer2.supervisor_password){
            console.log(Chalk.blue.bold("\n******************"))
            console.log(Chalk.blue.bold("Welcome "+ res[0].supervisor_name+"!!"))
            console.log(Chalk.blue.bold("******************\n"))
            Supervisor.askForOptions();
        }
        //If password does not match the one stored in database, show Incorrect password message
        //end the connection and go back to askForRole method
        else{
            console.log(Chalk.red("Incorrect Password"))
```
If supervisorID is valid and exists in database table supervisors, ask for the password and then match it with the password stored in the supervisors table. If it matches, show welcome message to the supervsior with his name else show an error message. If supervisor is able to log in successfully, show him the supervisor's options.

3. Display sales and profit by department
```
//displays the product sales and profit for each department
supervisor.displayProductSalesByDepartment = function(){

    var query = "SELECT department_id,departments.department_name,over_head_costs,
                CASE WHEN sum(product_sales) IS NULL THEN 0 ELSE sum(product_sales) END AS total_product_sales,CASE WHEN sum(product_sales) IS NULL THEN 0 ELSE sum(product_sales) END - over_head_costs AS total_profit";
    query+= " FROM products RIGHT OUTER JOIN departments";
    query+= " ON departments.department_name = products.department_name";
    query+= " GROUP BY departments.department_name,department_id,over_head_costs";

    supervisor.connection.query(query,function(err,res){
        if(err) throw err;

        //If no rows are returned, show appropriate message and show options of what to do next
        if(res.length === 0){
            console.log(Chalk.red("No department exists yet, select Add a department\n"))
```
Here we are joining two table products and departments on department name. Since, we also need departments that don't have any product, we used right outer join instead of inner join. In case of right outer join, departments that don't have any products belonging to them will show sum(product_sales) as null. We used Case to show these null values as 0. To show the values for each department, we used group by statement.

4. Take inputs for adding new department
```
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
```
In above code snippet, supervisor is asked to enter details of the new department, department name and over head cost of the department. Once he enters the details, a summary is shown to him and then he is asked for confirmation to add new department in the database.

5. Inserting new department in departments table
```
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
```
Once the supervisor confirms positively to add new department, the details that he entered earlier are inserted in the department table.

## Learning points
1. Using mysql package to interact with mysql server. This included creating connection, querying, using results in callback, ending connection.
2. Using inquirer package in a recursive fashion for interactive application building.
2. Using multiple packages like inquirer and mysql concurrently using callbacks to run the application without any unexpected program flow.
3. Extracting data from mysql server using input sanitization.
3. Updating, inserting and deleting data from database through node cli.
4. Using multiple packages like cfonts, chalk and cli-table for data formatting.


## Author 
* [Ajita Srivastava Github](https://github.com/ajitas)
* [Ajita Srivastava Portfolio](https://ajitas.github.io/Portfolio/)

## License
Standard MIT License


