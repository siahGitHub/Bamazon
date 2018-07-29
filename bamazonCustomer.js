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
  displayInventory();
});




function displayInventory(){
    var sqlWhere = "SELECT * FROM ?? WHERE ?? > ?";
      var selectValues = ['products', 'stock_quantity', 0];
      sql = mysql.format(sqlWhere, selectValues);
      connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        //console.log('Query execution results: ', results);
        console.table(results);
        itemSelect();
      });
};

function itemSelect() {
  inquirer
    .prompt([{
      name: "itemIdSelected",
      type: "input",
      message: "Enter the ID of item would you like to purchase:",
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
      message: "Enter the quantity of the items you would like to purchase: ",
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
              if (results[0].stock_quantity >= parseInt(answer.quantityOfItem)) {
                  //console.table(results);
                  purchaseItem(results[0].item_id, results[0].product_name, results[0].price, results[0].stock_quantity, answer.quantityOfItem);
              }
              else {
                  console.log("*************************************************************************");
                  console.log("Insufficient quantity! Please select a quantity equal to or less than "+ results[0].stock_quantity);
                  console.log("*************************************************************************");
                  displayInventory();
              };
          }
          else {
              console.log("*******************************************************");
              console.log("The ID selected doesn't exist! Please select a valid ID");
              console.log("*******************************************************");
              displayInventory();
          };
      });
    });
}

function purchaseItem(itemId, product_name, price, stock, quantity) {
    //console.log("You selected item ID: "+ itemId);
    var stock_remaining = parseInt(stock) - parseInt(quantity);
    var sqlUpdate = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    var updateValues = ['products', 'stock_quantity', stock_remaining, 'item_id', itemId];
    sql = mysql.format(sqlUpdate, updateValues);

    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        //console.log('Query execution results: ', results);
        console.log(`You selected to purchase ${quantity} ${product_name} at a cost of $${price} each.`);
        console.log(`Your total cost is $${(parseFloat(price) * parseFloat(quantity)).toFixed(2)}`);
        //displayInventory();
        inquirer
            .prompt({
                name: "morePurchases",
                type: "confirm",
                message: "Do you want to make another purchase?",
            }
            )
            .then(function (answer) {
                if (answer.confirm){
                    displayInventory();
                }else{
                    connection.end();
                }
            });
    });

};
