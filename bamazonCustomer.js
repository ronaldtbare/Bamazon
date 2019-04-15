var mysql = require("mysql");
var inquirer = require("inquirer");


// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;

  // print choices
  connection.query("SELECT item_id, product_name, price FROM products", function(err,rows){
    if(!err){
      console.log("Items Available");
      console.log("________________");
      for (var i=0; i<rows.length; i++){
        console.log(rows[i].item_id+" "+rows[i].product_name+" $"+rows[i].price)
      }
      // run the start function after the connection is made to prompt the user
      start();
    } else {
      console.log("Error. ", err);
    }

  })
  
});



// function which prompts the user for what action they should take
function start() {
  inquirer
    .prompt([
      {
        name: "selectedid",
        type: "input",
        message: "What is the ID of the product you would like to buy?"
      },

      {
        name: "selectedquantity",
        type: "input",
        message: "What is the purchase quantity of this item?"
      }
    ])
    .then(function (answers) {

      // console.log(JSON.stringify(answers));
      // console.log("quantity: ", answers.selectedquantity);
      // console.log("ID: ", answers.selectedid);
      var id = answers.selectedid;
      var quantity = answers.selectedquantity;
      //update database
      update(id, quantity);
    }

    );


  function update(id, quantity) {
    // console.log("the order id is: ", id);
    // console.log("the order quantity is: ", quantity);

    connection.query("SELECT stock_quantity FROM products WHERE item_id = ?", id,
      function (err, rows) {
        if (err) {
          console.log(err);
          return;
        }
        rows.forEach(function (result) {

          var db_quantity = result.stock_quantity;
          console.log("The quantity in the database is ", db_quantity);

          if (db_quantity < quantity) {
            console.log("---------------------------------------------")
            console.log("There is not enough stock to fill this order.");
            connection.end();
            return;
          }

          if (db_quantity >= quantity) {
            console.log("we will update db quantity.");

            var newQuantity = db_quantity - quantity;
            console.log("The new db quantity is ", newQuantity);

            connection.query("UPDATE products" +
              " SET stock_quantity = " + newQuantity +
              " WHERE item_id = ?", id,

              function (err, rows) {
                if (err) {
                  console.log(err);
                  return;
                }

              }

            )
            console.log("Database updated...");
            console.log("");
            printReceipt(id, quantity);
          }
        }

        )
      }
    )
  }
}

function printReceipt(id, quantity) {

  console.log("Here is your order.")

  connection.query("SELECT * FROM products WHERE item_id = ?", id,
    function (err, rows) {
      if (err) {
        console.log(err);
        return;
      }
      rows.forEach(function (result) {

        var name = result.product_name;
        
        var price = result.price;
        var total = price * quantity;
        // console.log("The price for item ID ", id," is ",price);
        console.log("-----------------");
        console.log("ItemID: ", id);
        console.log("Item Name: ", name);
        console.log("Price per unit: $", price)
        console.log("Quantity: ", quantity);
        console.log("-----------------");
        console.log("Total: $", total.toPrecision(4));

      });

    })
  connection.end();
}
