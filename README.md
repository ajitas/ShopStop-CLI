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
    * "View Products for sale" : Displays a list of products available in the store along with their IDs, prices, departments and stock available.
    * "View low inventory" : Displays a list of products in the store that have low inventory (less than 5), along with their IDs, prices, departments and stock available.
    * "Add inventory" : Takes the ID of the product that manager wants to add inventory for. It then asks how many items does the manager want to add. Once all the validation is done, a summary is shown to manager. Once he confirms, the new inventory is reflected in the database.
    * "Add new product" : Takes product name, department, price per unit and stock available from the manager. After validation, a summary is shown to the manager. Once he confirms, the new product details is added to the database.
    * "Quit" : The application exits execution.

3. Supervisor
    * If user chooses to run the application as a supervisor, his supervisorID and password is required. 
    * "View Product sales by department" : Supervisor can see product sales and profit for each department.
    * "Add new department" : Takes department name and its over head cost from the supervisor. A summary of information is shown to the supervisor and once he confirms, the new department information is added to the database.
    * "Quit" : The application exits execution.

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
The application will keep running as long as "Quit" is selected from the list at any stage. Once the user starts running the application taking a role of either customer, manager or supervisor, he can't change the role without exiting the application.

## Execution steps
1. Make sure node is installed on your machine. You can visit the website [Node Installation](http://blog.teamtreehouse.com/install-node-js-npm-mac) for instructions.
2. Download/Clone the respository.
3. Navigate on terminal to the ShopStop-CLI. Inside the folder, type "npm install". This will take all dependencies from package.json and install all the required packages to run the application.
4. Make sure mysql is installed on the localhost/other server. 
5. Log into mysql and execute schema.sql followed by seeds.sql from the repository.
6. Open shopstop.js and change createConnection function's parameter in all 3 places. Replace the configuartion keys with your values.
7. Inside ShopStop-CLI folder on terminal, type "node shopstop.js" on terminal. This will start application execution.

## Code snippets
```
```

## Learning points
1. Using mysql package to interact with mysql server. This included creating connection, querying, using results in callback, ending connection.
2. Using inquirer package in a recursive fashion for interactive application building.
2. Using multiple packages like inquirer and mysql concurrently using callbacks to run the application without any unexpected program flow.
3. Extracting data from mysql server using input sanitization.
3. updating, inserting and deleting data from database through node cli.
4. Using multiple packages like cfonts, chalk and cli-table for data formatting.


## Author 
* [Ajita Srivastava Github](https://github.com/ajitas)
* [Ajita Srivastava Portfolio](https://ajitas.github.io/Portfolio/)

## License
Standard MIT License


