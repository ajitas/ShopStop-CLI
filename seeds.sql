INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES
("banana", "fresh produce", 0.79, 600),
("chicken", "meat", 10.00, 50 ),
("bread", "bakery", 4.99, 350),
("ice cream", "frozen", 5.99, 100),
("milk", "dairy", 7.99, 200),
("cheese", "dairy", 6.99, 300),
("cookies", "bakery", 3.99, 180),
("salt", "condiments & spice", 3.99,250),
("baby formula", "baby care", 20.00,150),
("orange Juice","beverages",10.00,500),
("cheerios","breakfast & cereal",6.89,100),
("brownie bites","bakery",12.99,70),
("chicken broth","canned goods",9.99,140);

INSERT INTO departments(department_name,over_head_costs) VALUES 
("fresh produce",20),
("meat",100),
("bakery",10),
("frozen",200),
("dairy",50),
("condiments & spice",5),
("baby care",25),
("beverages",15),
("breakfast & cereal",70),
("canned goods",30);

INSERT INTO managers(manager_name,manager_pwd) VALUES
("Mike","manager1"),
("Jake","manager2"),
("Andy","manager3"),
("Jimmy","manager4");

INSERT INTO supervisors(supervisor_name,supervisor_pwd) VALUES
("Brandon","supervisor1"),
("John","supervisor2"),
("Claire","supervisor3"),
("Peter","supervisor4");