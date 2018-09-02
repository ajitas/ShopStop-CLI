create database shopstop_db;

use shopstop_db;

create table products(
    product_id integer auto_increment not null,
    product_name varchar(50),
    department_name varchar(30),
    price decimal (10,2),
    stock_quantity integer,
    product_sales decimal (10,2) default 0,
    primary key(product_id)
);

create table departments(
    department_id integer auto_increment not null,
    department_name varchar(30),
    over_head_costs decimal (10,2) not null,
    primary key(department_id)
);