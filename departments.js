// module.exports = function(){
//     var express = require('express');
//     var router = express.Router();

//     function getDepartments(res, mysql, context, complete){
//         mysql.pool.query("SELECT `department_id`, `name` FROM `Departments`", function(error, results, fields){
//             if(error){
//                 res.write(JSON.stringify(error));
//                 res.end();
//             }
//             context.departments = results;
//             console.log(results);
//             complete();
//         });
//       }
      
//       router.get('/departments', function(req, res){
//         // var callbackCount = 0;
//         var context = {};
//         //context.jsscripts = ["squishies.js"];
//         var mysql = req.app.get('mysql');
//         getDepartments(res, mysql, context, complete);
        
//         function complete(){
//             // callbackCount++;
//             // if(callbackCount >= 2){
//             //     res.render('departments.handlebars', context);
//             // }
//           res.render('departments.handlebars', context);
//         }
//       });


//     return router;
// }();
