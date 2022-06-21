const mysql = require('mysql2');

const dbhost = process.env.DBHOST || 'localhost';
const dbname = process.env.DBNAME || 'loyalty';
const dbuser = process.env.DBUSER || 'loyalty';
const dbpass = process.env.DBPASS || 'password';

console.log(`Using database ${dbuser}@${dbname} at ${dbhost}`);

module.exports = mysql.createPool({
    host: dbhost,
    database: dbname,
    user: dbuser,
    password: dbpass,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});
