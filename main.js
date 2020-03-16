/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/


var express = require('express');

var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});


app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);


// route for static home page
app.get('/', function(req,res){
  var context = {};
  res.render('home', context);
});

// route for static accounts page
app.get('/accounts', function(req,res){
  var context = {};
  res.render('accounts', context);
});

// route for static register page
app.get('/register', function(req,res){
  var context = {};
  res.render('register', context);
});

// function to get all departments for departments page
function getDepartments(res, mysql, context, complete){
  mysql.pool.query("SELECT `department_id`, `name` FROM `Departments`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.departments = results;
      complete();
  });
}

// function to get products for each department
function getProducts(res, mysql, context, deptName, complete){
  var sql = "SELECT `name`, `image_path`, `description`, `price` FROM `Products` WHERE `department_id`=(SELECT `department_id` FROM `Departments` WHERE `name`=?)";
  var inserts = [deptName];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.products = results;

      complete();
  });
}

// function to get a product based on a user inputted product name in search bar
function searchProducts(res, mysql, context, prodName, complete){
  var sql = "SELECT `name`, `image_path`, `description`, `price` FROM `Products` WHERE `name` LIKE ?";
  var inserts = "%" + [prodName] + "%";
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.products = results;

      complete();

  });
}

// function to get all departments information for admin page
function getAllDepartments(res, mysql, context, complete){
  mysql.pool.query("SELECT * FROM `Departments`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.departments = results;

      complete();
  });
}

// function to get all products information for admin page
function getAllProducts(res, mysql, context, complete){
  mysql.pool.query("SELECT * FROM `Products`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.products = results;

      complete();
  });
}

// function to get all orders information for admin page
function getAllOrders(res, mysql, context, complete){
  mysql.pool.query("SELECT * FROM `Orders`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.orders = results;

      complete();
  });
}

// function to get all customers information for admin page
function getAllCustomers(res, mysql, context, complete){
  mysql.pool.query("SELECT * FROM `Customers`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.customers = results;

      complete();
  });
}

// function to get customer id based on user inputted email
function getCustId(res, mysql, context, custEmail, complete){
  var sql = "SELECT `customer_id` FROM `Customers` WHERE `email` = ?";
  var inserts = [custEmail];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.custid = results[0].customer_id;

      complete();
      return results[0].customer_id;
  });
}

// function to start an order for a customer
function addOrder(res, mysql, context, custEmail, orderDelvMeth, complete){
    var date = new Date();
    var sql = "INSERT INTO `Orders`(`customer_id`, `order_date`) VALUES ((SELECT `customer_id` FROM `Customers` WHERE `email`= ?), ?)";
    var inserts = [custEmail, date];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          context.message = "error, please register with us first!";
        }else{
          context.message = "order created";
        }

        complete();
    });


}

// route for departments page that calls addOrder and getDepartments
app.post('/departments', function(req, res){

  var callbackCount = 0;
  let custEmail = req.body.custEmail;
  let orderDelvMeth = req.body.orderDelvMeth;
  var context = {};
  var mysql = req.app.get('mysql');

  addOrder(res, mysql, context, custEmail, orderDelvMeth, complete);
  getDepartments(res, mysql, context, complete);

  function complete(){
      callbackCount++;
      if(callbackCount >= 2){
          res.render('departments.handlebars', context);
      }
  }
});

// route for departments page that calls getDepartments
app.get('/departments', function(req, res){
  var context = {};
  var mysql = req.app.get('mysql');
  getDepartments(res, mysql, context, complete);

  function complete(){

    res.render('departments.handlebars', context);
  }

});

// route for products page that calls getDepartments and getProducts
app.get('/departments/:departmentName', function(req , res){
  var callbackCount = 0;
  let departmentName = req.params.departmentName;
  var context = {};
  context.departmentName = departmentName;
  var mysql = req.app.get('mysql');
  getDepartments(res, mysql, context, complete);
  getProducts(res, mysql, context, departmentName, complete);
  function complete(){
      callbackCount++;
      if(callbackCount >= 2){
          res.render('products.handlebars', context);
      }
  }
});

// route for product page that calls searchProducts
app.post('/product', function(req, res){
  let prodName = req.body.prodName;
  var context = {};
  var mysql = req.app.get('mysql');

  searchProducts(res, mysql, context, prodName, complete);

  function complete(){
      res.render('product.handlebars', context);
  }
});


// app.get('/account', function(req, res){
//   var callbackCount = 0;
//   let custID = req.params.custID
//   var context = {};
//   var mysql = req.app.get('mysql');
//   getCustId(res, mysql, context, complete);
//   getAccount(res, mysql, context, custID, complete);
//   function complete(){
//       callbackCount++;
//       if(callbackCount >= 2){
//           res.render('account.handlebars', context);
//       }
//   }
// });

//for cookies session?

// function that gets customer information based in user inputted email
function getCustomer(res, mysql, context, custEmail, complete){
  var sql = "SELECT * FROM `Customers` WHERE `email` = ?";
  var inserts = [custEmail];

  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.custInfo = results[0];

      complete();

  });
}

// function that gets the orders of a customer based on the customer id
function getOrders(res, mysql, context, customer_id, complete) {
  var sql = "SELECT * FROM `Orders` WHERE `customer_id` = ?";
  var inserts = [customer_id];

  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }

      context.custOrders = results;
      complete();
  });
}

// function getDetails(res, mysql, context, order_id, complete) {
//   var sql = "SELECT * FROM `Order_Details` WHERE `order_id` = ?";
//   var inserts = [order_id];
//
//   mysql.pool.query(sql, inserts, function(error, results, fields){
//       if(error){
//           res.write(JSON.stringify(error));
//           res.end();
//       }
//
//       context.details = results;
//       complete();
//   });
// }

// route for accounts page that calls getCustomer and getOrders
app.post('/account', function(req, res){
  var callbackCount = 0;
  let custEmail = req.body.custEmail;
  var context = {};
  var mysql = req.app.get('mysql');

  getCustomer(res, mysql, context, custEmail, complete);

  function complete(){
      callbackCount++;
      if(callbackCount == 1){
        let customer_id = context.custInfo.customer_id;
        getOrders(res, mysql, context, customer_id, complete);
      }
      // if(callbackCount == 2){
      //   let order_id = context.custOrders.order_id;
      //   getDetails(res, mysql, context, order_id, complete)
      // }
      // if(context.custOrders.order_id==NULL){
      //   if(callbackCount >= 2){
      //     //context.customerInfo = results;
      //     res.render('account.handlebars', context);
      //   }
      // }
      if(callbackCount >= 2){
        //context.customerInfo = results;
        res.render('account.handlebars', context);
      }
  }
});


app.get('/checkout', function(req,res){
  var context = {};
  res.render('checkout', context);
});

// route that calls getAll functions to populate admin page
app.get('/admin', function(req,res){
  var context = {};
  var callbackCount=0;
  var mysql = req.app.get('mysql');

  getAllDepartments(res, mysql, context, complete);
  getAllProducts(res, mysql, context, complete);
  getAllCustomers(res, mysql, context, complete);
  getAllOrders(res, mysql, context, complete);

  function complete(){
      callbackCount++;
      if(callbackCount >= 4){
        res.render('admin', context);
      }

  }

});

// function that adds a department to the Departments table
function addDepartment(res, mysql, context, dept_name, complete){
    var sql = "INSERT INTO `Departments` (`name`) VALUES (?)";
    var inserts = [dept_name];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          res.write(JSON.stringify(error));
          res.end();
        }
        complete();
    });
}

// function that deletes a customer from the Customers table
function deleteCustomer(res, mysql, context, customer_id, complete){
  var sql = "DELETE FROM `Customers` WHERE `customer_id` = ?";
  var inserts = [customer_id];

  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      complete();
  });
}

// function that deletes an order from the Orders table
function deleteOrder(res, mysql, context, order_id, complete){
  var sql = "DELETE FROM `Orders` WHERE `order_id` = ?";
  var inserts = [order_id];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      complete();
  });
}

// function that deletes a product from the Products table
function deleteProduct(res, mysql, context, product_id, complete){
  var sql = "DELETE FROM `Products` WHERE `product_id` = ?";
  var inserts = [product_id];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      complete();
  });
}

// function that adds a product to the Products table
function addProduct(res, mysql, context, prod_name, dept_id, price, complete){
    var sql = "INSERT INTO `Products` (`name`, `department_id`, `price`) VALUES (?, ?, ?)";
    var inserts = [prod_name, dept_id, price];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          res.write(JSON.stringify(error));
          res.end();
        }
        complete();
    });
}


// route that calls the relevant function for the admin page then refreshes the page
app.post('/admin', function(req,res){

  var context = {};
  var callbackCount=0;
  var mysql = req.app.get('mysql');
  if (req.body.customer_id) {
    let customer_id = req.body.customer_id;
    complete();
    deleteCustomer(res, mysql, context, customer_id, complete);
  }
  if (req.body.order_id) {
    let order_id = req.body.order_id;
    complete();
    deleteOrder(res, mysql, context, order_id, complete);
  }
  if (req.body.product_id) {
    let product_id = req.body.product_id;
    complete();
    deleteProduct(res, mysql, context, product_id, complete);
  }
  if (req.body.dept_name) {
    let dept_name = req.body.dept_name;
    complete();
    addDepartment(res, mysql, context, dept_name, complete);
  }
  if (req.body.prod_name) {
    let prod_name = req.body.prod_name;
    let dept_id = req.body.dept_id;
    let price = req.body.price;
    complete();
    addProduct(res, mysql, context, prod_name, dept_id, price, complete)
  }

  getAllDepartments(res, mysql, context, complete);
  getAllProducts(res, mysql, context, complete);
  getAllCustomers(res, mysql, context, complete);
  getAllOrders(res, mysql, context, complete);

  function complete(){
      callbackCount++;
      if(callbackCount >= 6){

        res.render('admin', context);
      }

  }

});

app.get('/updateProducts/:prodID', function(req, res){
  var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var prodID;
  // console.log(prodID);

  prodID = req.params.prodID;
  getSelectedProduct(res, mysql, context, prodID, complete);
  getAllDepartments(res, mysql, context, complete);


  function complete(){
    callbackCount++;
    if(callbackCount == 1){

    }
    if(callbackCount >= 2){
      console.log(context);
      //let deptID = context.departments.department_id;
      //updateProduct(res, mysql, context, deptID, prodName, prodImage, prodPrice, prodDesc, prodSale, prodStock, prodID, complete);
      res.render('updateProducts.handlebars', context);
    }
  }

});

function getSelectedProduct(res, mysql, context, prodID, complete) {
  var sql = "SELECT * FROM `Products` WHERE `product_id`=?";
  var inserts = [prodID];
  //console.log(prodID);
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      //console.log(results);
      context.product=results[0];
      //console.log(context.product);
      complete();
  });
}


function updateProduct(res, mysql, context, deptID, prodName, prodImage, prodPrice, prodDesc, prodSale, prodStock, prodID, complete) {
  var sql = "UPDATE `Products` SET `department_id`=?,`name`=?,`image_path`=?,`price`=?,`description`=?,`sale`=?,`stock`=? WHERE `product_id`=?";
  var inserts = [deptID, prodName, prodImage, prodPrice, prodDesc, prodSale, prodStock, prodID];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      context.message = "Updated successfully!";
      complete();
  });
}

app.post('/updateProducts', function(req, res){
    //callbackCount = 0;

    let deptID = req.body.deptID;
    let prodName = req.body.prodName;
    let prodImage = req.body.prodImage;
    let prodPrice = req.body.prodPrice;
    let prodDesc = req.body.prodDesc;
    let prodSale = req.body.prodSale;
    let prodStock = req.body.prodStock;
    let prodID = req.body.prodID;

    console.log(prodName);
    console.log(prodPrice);

    var context = {};
    var mysql = req.app.get('mysql');

    //getDepartments(res, mysql, context, complete);
    updateProduct(res, mysql, context, deptID, prodName, prodImage, prodPrice, prodDesc, prodSale, prodStock, prodID, complete);
    function complete(){
      //callbackCount++;
      //if(callbackCount == 1){
        //let deptID = context.departments.department_id;

        res.render('updateProducts.handlebars', context);
      //}
    }
});


app.get('/updateOrders/:orderID', function(req, res){
  //var callbackCount = 0;
  var context = {};
  var mysql = req.app.get('mysql');
  var orderID;
  // console.log(prodID);

  orderID = req.params.orderID;
  getSelectedOrder(res, mysql, context, orderID, complete);

  function complete(){
    // callbackCount++;
    // if(callbackCount == 1){
    //
    // }
    // if(callbackCount >= 2){
      console.log(context);
      //let deptID = context.departments.department_id;
      //updateProduct(res, mysql, context, deptID, prodName, prodImage, prodPrice, prodDesc, prodSale, prodStock, prodID, complete);
      res.render('updateOrders.handlebars', context);
    // }
  }

});

function getSelectedOrder(res, mysql, context, orderID, complete) {
  var sql = "SELECT * FROM `Orders` WHERE `order_id`=?";
  var inserts = [orderID];
  //console.log(prodID);
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      //console.log(results);
      context.order=results[0];
      //console.log(context.product);
      complete();
  });
}


function updateOrder(res, mysql, context, status, recDate, shipDate, orderID, complete) {
  var sql = "UPDATE `Orders` SET `order_status`=?, `received_date`=?, `shipped_date`=? WHERE `order_id`=?";
  var inserts = [status, recDate, shipDate, orderID];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      context.message = "Updated successfully!";
      complete();
  });
}

app.post('/updateOrders', function(req, res){
    //callbackCount = 0;
    let orderID = req.body.orderID;
    let status = req.body.status;
    let recDate = req.body.recDate;
    let shipDate = req.body.shipDate;

    var context = {};
    var mysql = req.app.get('mysql');

    //getDepartments(res, mysql, context, complete);
    updateOrder(res, mysql, context, status, recDate, shipDate, orderID, complete)
    function complete(){
      //callbackCount++;
      //if(callbackCount == 1){
        //let deptID = context.departments.department_id;

        res.render('updateOrders.handlebars', context);
      //}
    }
});



function addCustomer(res, mysql, context, custName, custEmail, custAddr, custCity, custZip, custPhone, complete){
    var sql = "INSERT INTO `Customers` (`name`, `email`, `street_address`, `city`, `zipcode`, `phone`) VALUES (?, ?, ?, ?, ?, ?)";
    var inserts = [custName, custEmail, custAddr, custCity, custZip, custPhone];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
          res.write(JSON.stringify(error));
          res.end();
        }
        context.message = "Account created!";
        complete();
    });
}

app.post('/register', function(req, res){
    let custName = req.body.custName;
    let custEmail = req.body.custEmail;
    let custAddr = req.body.custAddr;
    let custCity = req.body.custCity;
    let custZip = req.body.custZip;
    let custPhone = req.body.custPhone;

    var context = {};
    var mysql = req.app.get('mysql');

    addCustomer(res, mysql, context, custName, custEmail, custAddr, custCity, custZip, custPhone, complete);

    function complete(){
        res.render('register.handlebars', context);

    }
});


// route that redirects in the case of a 404 eror
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// route that redirects in the case of a 500 error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu/:' + app.get('port') + '; press Ctrl-C to terminate.');
});
