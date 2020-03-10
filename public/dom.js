document.addEventListener('DOMContentLoaded', bindButtons);
console.log("in dom");
function getCustId(res, mysql, context, custEmail, complete){
    var sql = "SELECT `customer_id` FROM `Customers` WHERE `email`= ?";
    var inserts = [custEmail];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
            console.log("this email doesn't exist");
        }
        context.custId = results[0];
        complete();
    });
    return custId;
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

function bindButtons(){
  document.getElementById("emailButton").addEventListener('click', function(event){

    let custEmail = document.getElementById("emailInput").value;
    let orderMethod = document.getElementById("orderMethod").value;

    let custId = getCustId(res, mysql, context, custEmail, complete);

    addOrder(res, mysql, custId, orderMethod, complete)

  });
}
