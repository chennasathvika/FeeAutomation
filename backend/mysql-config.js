const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sathvika09',
  database: 'chennaDB'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database Connected');
});

module.exports = db;