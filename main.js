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



app.use('/people', require('./people.js'));
//app.use('/departments', require('./departments.js'));

app.get('/', function(req,res){
  var context = {};
  res.render('home', context);
});
app.get('/accounts', function(req,res){
  var context = {};
  res.render('accounts', context);
});




app.get('/register', function(req,res){
  var context = {};
  res.render('register', context);
});

function getDepartments(res, mysql, context, complete){
  mysql.pool.query("SELECT `department_id`, `name` FROM `Departments`", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.departments = results;
      //console.log(results);
      complete();
  });
}

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
      // console.log(results);
      // console.log(results[0]);
      console.log(results[0].customer_id);
      return results[0].customer_id;
  });
}


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


app.get('/departments', function(req, res){
  var context = {};
  //context.jsscripts = ["squishies.js"];
  var mysql = req.app.get('mysql');
  getDepartments(res, mysql, context, complete);

  function complete(){

    res.render('departments.handlebars', context);
  }

});

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

function getCustomer(res, mysql, context, custEmail, complete){
  var sql = "SELECT * FROM `Customers` WHERE `email` = ?";
  var inserts = [custEmail];

  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }

      context.custInfo = results[0];
      //context.custid = results[0].customer_id;

      complete();

  });
}

//SELECT Products.name, `detail_id`, Orders.order_id, OrderDetails.product_id, `quantity`, `discount`, `unit_price`, `subtotal`, `customer_id`, `order_status`, `order_date`,`delivery_method`,`order_total`FROM `Orders` JOIN `OrderDetails` ON OrderDetails.order_id = Orders.order_id JOIN `Products` ON OrderDetails.product_id = Products.product_id AND `customer_id`=?

function getOrders(res, mysql, context, customer_id, complete) {
  var sql = "SELECT * FROM `Orders` WHERE `customer_id` = ?";
  var inserts = [customer_id];

  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }

      context.custOrders = results;
      console.log(results);
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


app.get('/admin', function(req,res){
  var context = {};
  var callbackCount=0;
  //context.jsscripts = ["squishies.js"];
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

function deleteProduct(res, mysql, context, product_id, complete){
  var sql = "DELETE FROM `Products` WHERE `product_id` = ?";
  var inserts = [product_id];
  //console.log("order id is: ", order_id);
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      complete();
  });
}


app.post('/admin', function(req,res){

  var context = {};
  var callbackCount=0;
  //context.jsscripts = ["squishies.js"];
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

  //deleteCustomer(res, mysql, context, customer_id, complete);
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







app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
