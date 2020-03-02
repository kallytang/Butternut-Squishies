var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_syedm',
  password        : '6396',
  database        : 'cs340_syedm'
});
module.exports.pool = pool;
