const mysql = require("mysql");
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "broblogs",
});
module.exports = pool;
