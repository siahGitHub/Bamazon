const cTable = require('console.table');
var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'siahDB',
  password: 'siahDB#1623',
  database: 'bamazon'
});

connection.connect(function(err) {
  if (err) throw err;
  menuOptions();
});

function menuOptions(){
    inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "Please select from the menu options below:",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Quit Menu"
      ]
    })
      .then(function (answer) {
        switch (answer.action) {
          case "View Products for Sale":
            viewProducts();
            break;

          case "View Low Inventory":
            viewLowIventory();
            break;

          case "Add to Inventory":
            addIventory();
            break;

          case "Add New Product":
            addProduct();
            break;

          case "Quit Menu":
            connection.end();
            break;
        }
    });
};

function viewProducts() {
    var sqlWhere = "SELECT * FROM ?? ";
    var selectValues = ['products'];
    sql = mysql.format(sqlWhere, selectValues);
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        //console.log('Query execution results: ', results);
        console.table(results);
        menuOptions();
    });
};

function viewLowIventory() {
    var sqlWhere = "SELECT * FROM ?? WHERE ?? < ?";
    var selectValues = ['products', 'stock_quantity', 5];
    sql = mysql.format(sqlWhere, selectValues);
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        //console.log('Query execution results: ', results);
        console.table(results);
        menuOptions();
    });
};

function updateItem(itemId, product_name, price, stock, quantity){
    var stock_increase = parseInt(stock) + parseInt(quantity);
    var sqlUpdate = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    var updateValues = ['products', 'stock_quantity', stock_increase, 'item_id', itemId];
    sql = mysql.format(sqlUpdate, updateValues);

    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        //console.log('Query execution results: ', results);
        console.log(`You selected to increase the inventory of ${product_name} by ${quantity}.`);
        console.log(`Your inventory for ${product_name} is ${stock_increase}`);
        inquirer
            .prompt({
                name: "addMoreInventory",
                type: "confirm",
                message: "Do you want to add more inventory?",
            }
            )
            .then(function (answer) {
                if (answer.confirm){
                    addInventory();
                }else{
                    connection.end();
                }
            });
    });
    
};

function addIventory(){
    inquirer
    .prompt([{
      name: "itemIdSelected",
      type: "input",
      message: "Enter the ID of item would you would like to add inventory to:",
      validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
    },
    {
      name: "quantityOfItem",
      type: "input",
      message: "How much do you want to increase the inventory by: ",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ])
    .then(function(answer) {
     //console.log("You selected item ID: "+ answer.itemIdSelected);
     //console.log(`Your quantity of the item is: ${answer.quantityOfItem}`);
     var sqlWhere = "SELECT * FROM ?? WHERE ?? = ?";
      var selectValues = ['products', 'item_id', answer.itemIdSelected];
      sql = mysql.format(sqlWhere, selectValues);
      connection.query(sql, function (error, results, fields) {
          if (error) throw error;
          //console.log('Query execution results: ', results);
          if (results.length > 0) {
                  //console.table(results);
                  updateItem(results[0].item_id, results[0].product_name, results[0].price, results[0].stock_quantity, answer.quantityOfItem);
          }
          else {
              console.log("*******************************************************");
              console.log("The ID selected doesn't exist! Please select a valid ID");
              console.log("*******************************************************");
              menuOptions();
          };
      });
    });
};

function addProduct() {

  inquirer
    .prompt([{
      name: "itemName",
      type: "input",
      message: "Please enter the name of the product:"
    },
    {
      name: "deptOfItem",
      type: "input",
      message: "Please enter the department name for where the product will be added: "
    },
    {
      name: "itemPrice",
      type: "input",
      message: "Please enter the cost of the product:",
      validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
    },
    {
      name: "stockQuantity",
      type: "input",
      message: "Please enter the amount of inventory for the product: ",
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
    ])
    .then(function (answer) {
      var product_data =
      {
        product_name: answer.itemName,
        department_name: answer.deptOfItem,
        price: answer.itemPrice,
        stock_quantity: answer.stockQuantity
      };
      var sqlInsert = "INSERT INTO ?? SET ?";
      var insertValues = ['products', product_data];
      sql = mysql.format(sqlInsert, insertValues);
      //connection.query('INSERT INTO songs SET ?', product_data, function (error, results, fields) {
        connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log('Query execution results: ', results);
        menuOptions();
      });
    });
}