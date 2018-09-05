//import all the required packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var CFonts = require("cfonts");
var Chalk = require("chalk");
var Manager = require("./shopstop-manager");
var Customer = require("./shopstop-customer");
var Supervisor = require("./shopstop-supervisor");

//usinf cfonts, the game heading is styled and displayed on terminal
CFonts.say('===========', {
    font: 'chrome',                 // define the font face
    align: 'center',                // define text alignment
    colors: [,'blueBright'],        // define all colors
    background: 'transparent',      // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,               // define letter spacing
    lineHeight: 1,                  // define the line height
    space: false,                   // define if the output text should have empty lines on top and on the bottom
    maxLength: 20,                  // define how many character can be on one line
});
CFonts.say('SHOPSTOP', {
    font: 'chrome',                 // define the font face
    align: 'center',                // define text alignment
    colors: ['cyan','blueBright'],  // define all colors
    background: 'transparent',      // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,               // define letter spacing
    lineHeight: 1,                  // define the line height
    space: false,                   // define if the output text should have empty lines on top and on the bottom
    maxLength: 20,                  // define how many character can be on one line
});
CFonts.say('===========', {
    font: 'chrome',                 // define the font face
    align: 'center',                // define text alignment
    colors: [,'blueBright'],        // define all colors
    background: 'transparent',      // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,               // define letter spacing
    lineHeight: 1,                  // define the line height
    space: false,                   // define if the output text should have empty lines on top and on the bottom
    maxLength: 20,                  // define how many character can be on one line
});

//start the application
askForRole();

//asks user if the user wants to enter as a customer, manager or supervisor
function askForRole(){
    inquirer.prompt([{
        message:"Select your role?",
        name:"role",
        choices:["Customer","Manager","Supervisor","Quit"],
        type:"list"
    }]).then(function(answer){
        switch (answer.role){
            case "Customer":    customerOptions();
                                break;
            case "Manager":     managerOptions();
                                break;
            case "Supervisor":  supervisorOptions();
                                break;
        }
    });
}

//if the user enters the application as a customer
function customerOptions(){

    //create a connection with connection configuration
    Customer.connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "shopstop_db"
    });
    
    //connect to the database; once connected call askForShopping 
    //method that asks if the customer wants to shop or quit
    Customer.connection.connect(function (err) {
        if (err) throw err;
        Customer.askForShopping();
    });
}

//if the user enters the application as a manager
function managerOptions(){

    //create a connection with connection configuration
    Manager.connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "shopstop_db"
    });
    
    //connect to the database
    Manager.connection.connect(function (err) {
        if (err) throw err;

        //once connected ask the manager to enter his ID
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
            },function(err,res){

                //if managerID is not present in the database table; end the connection and ask for ID again
                if(res.length === 0){
                    console.log(Chalk.red("Invalid ID"))
                    Manager.connection.end();
                    managerOptions();
                }
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
                            Manager.connection.end();
                            askForRole();
                        }
                    });
                }
            });

        });
    });
}

//if the user enters the application as a supervisor
function supervisorOptions(){

    //create a connection with connection configuration
    Supervisor.connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        database: "shopstop_db"
    });
    
    //connect to the database
    Supervisor.connection.connect(function (err) {
        if (err) throw err;

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
                    Supervisor.connection.end()
                    supervisorOptions();
                }
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
                            Supervisor.connection.end();
                            askForRole();
                        }
                    });
                }
            });
    
        });
    });
}