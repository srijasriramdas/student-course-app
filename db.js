// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql', // ⬅️ Replace this with your real password
  database: 'student_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL Database');
});

module.exports = db;
