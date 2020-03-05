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



function getAccount(res, mysql, context, id, complete){
  var sql = "SELECT `customer_id`, `name`, `email`, `street_address`, `city`, `state`,  `zipcode`, `phone` FROM `Customers` WHERE `email`= ?";
  var inserts = [custEmail];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.account = results[0];
      complete();
  });
}
//



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
      console.log(results);
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



function getAccount(res, mysql, context, custid, complete){
  var sql = "SELECT `customer_id`, `name`, `email`, `street_address`, `city`, `state`,  `zipcode`, `phone` FROM `Customers` WHERE `email`= ?";
  var inserts = [custEmail];
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.account = results.customer_id;
      complete();
  });
}

function getCustId(res, mysql, context, id, complete){
        var sql = "SELECT `customer_id` FROM `Customers` WHERE `email`= ?";
        var inserts = [custEmail];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.custId = results[0];
            complete();
        });
        console.log(custId);
    }
    function addOrder(res, mysql, custId, orderDelvMeth, complete){
        var sql = "INSERT INTO `Orders`(`customer_id`,`delivery_method`) VALUES (?, ?)";
        var inserts = [custId, orderDelvMeth];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            //context.person = results[0];
            complete();
        });
    }
    app.post('/departments', function(req, res){
      var callbackCount = 0;
      let custID = req.body.custID;
      let orderDelvMeth = req.body.orderDelvMeth;
      var context = {};
      var mysql = req.app.get('mysql');
      getCustId(res, mysql, context, complete);
      addOrder(res, mysql, custID, orderDelvMeth, complete);
      function complete(){
          callbackCount++;
          if(callbackCount >= 2){
              res.render('departments.handlebars', context);
          }
      }
    });




    function getCustId(res, mysql, context, custEmail, complete){
      console.log("in customer id ");
      var sql = "SELECT `customer_id` FROM `Customers` WHERE `email`= ?";
      var inserts = [custEmail];
      mysql.pool.query(sql, inserts, function(error, results, fields){
          if(error){
              res.write(JSON.stringify(error));
              res.end();
          }
          context.custId = results[0];
          complete();
      });
      console.log(custId);
      console.log("in customer id ");
  }
  function addOrder(res, mysql, context, custId, orderDelvMeth, complete){
      var sql = "INSERT INTO `Orders`(`customer_id`,`delivery_method`) VALUES (?, ?)";
      var inserts = [custId, orderDelvMeth];
      mysql.pool.query(sql, inserts, function(error, results, fields){
          if(error){
              res.write(JSON.stringify(error));
              res.end();
          }
          //context.person = results[0];
          complete();
      });
  }
  app.post('/departments', function(req, res){
    console.log("in app post departments");
    var callbackCount = 0;
    let custEmail = req.body.custEmail;
    let orderDelvMeth = req.body.orderDelvMeth;
    var context = {};
    var mysql = req.app.get('mysql');
    getCustId(res, mysql, context, custEmail,  complete);
    addOrder(res, mysql, context, custID, orderDelvMeth, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 2){
            res.render('departments.handlebars', context);
        }
    }
    console.log("in app post departments");
  });


app.get('/departments', function(req, res){
  // var callbackCount = 0;
  var context = {};
  //context.jsscripts = ["squishies.js"];
  var mysql = req.app.get('mysql');
  getDepartments(res, mysql, context, complete);
  
  function complete(){
      // callbackCount++;
      // if(callbackCount >= 2){
      //     res.render('departments.handlebars', context);
      // }
    res.render('departments.handlebars', context);
  }
  console.log("i'm here");
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
      //res.render('products.handlebars', {context});
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

app.get('/account', function(req, res){
  var callbackCount = 0;
  let custID = req.params.custID
  var context = {};
  var mysql = req.app.get('mysql');
  getCustId(res, mysql, context, complete);
  getAccount(res, mysql, context, custID, complete);
  function complete(){
  //     callbackCount++;
  //     if(callbackCount >= 2){
          res.render('account.handlebars', context);
      // }
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
 
  getAllProducts(res, mysql, context, complete);
  getAllCustomers(res, mysql, context, complete);
  getAllOrders(res, mysql, context, complete);
  
  function complete(){
      callbackCount++;
      if(callbackCount >= 3){
        res.render('admin', context);
      }
     
  }
  // res.render('admin', context);
  
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
