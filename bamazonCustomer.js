var mysql = require("mysql");
var inquirer = require("inquirer");
const chalk = require("chalk");
const gradient = require('gradient-string');
const log = console.log;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
})

connection.connect(function (err) {
    log("Connected as id: " + connection.threadId);
})

function bamazon () {
    connection.query("SELECT * FROM products", function (err, res, fields) {
        log(gradient.atlas("=========================================================="));
        for (var i = 0; i < res.length; i++) {
            log(chalk.magenta("Product ID: ") + chalk.red.yellow(res[i].item_id) + " " +
                chalk.white(res[i].product_name));
        }
        log(gradient.atlas("=========================================================="));

        inquirer.prompt({
            name: "question",
            type: "input",
            message: chalk.magenta("Which product ID would you like to purchase?")
        }).then(function (answer) {
            var id = answer.question;
            log(id);
            inquirer.prompt({
                name: "unit",
                type: "input",
                message: chalk.magenta("How many units of the product would you like to purchase?")
            }).then(function (answer) {
                var quantity = answer.unit;
                log(quantity);

                connection.query("SELECT * FROM products WHERE item_id = ?", [id], function (err, res, fields) {
                    if (err) throw err;
                    var price = res[0].price;
                    var total = price * quantity;
                    var stock = res[0].stock_quantity;
                    var newStock = res[0].stock_quantity - quantity;
                    if (quantity > stock) {
                        log(chalk.yellow("⚠️  ") + chalk.red("Insufficient quantity!") + chalk.yellow("  ⚠"));
                        bamazon();
                    } else {
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ? ", [newStock, id], function (err, res, fields) {
                            if (err) throw err;
                        })
                        log(gradient.atlas("==============================="));
                        log(chalk.green("Your order has been placed!"));
                        log(chalk.yellow("Total: ") + "$" + total);
                        log(gradient.atlas("==============================="));
                    }
                });
            });
        });
    });
}
bamazon();