CREATE DATABASE shopstop_db;

USE shopstop_db;

CREATE TABLE products(
    product_id INTEGER AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    product_sales DECIMAL(10,2) DEAFULT 0,
    PRIMARY KEY(product_id)
);

CREATE TABLE departments(
    department_id INTEGER AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL,
    PRIMARY KEY(department_id)
);

CREATE TABLE managers(
    manager_id INTEGER AUTO_INCREMENT NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    manager_pwd VARCHAR(20) NOT NULL,
    PRIMARY KEY(manager_id)
);

CREATE TABLE supervisors(
    supervisor_id INTEGER AUTO_INCREMENT NOT NULL,
    supervisor_name VARCHAR(100) NOT NULL,
    supervisor_pwd VARCHAR(20) NOT NULL,
    PRIMARY KEY(supervisor_id)
);