import mysql from 'mysql2/promise.js';

const dbhost = process.env.DBHOST || 'localhost';
const dbname = process.env.DBNAME || 'loyalty';
const dbuser = process.env.DBUSER || 'loyalty';
const dbpass = process.env.DBPASS || 'password';

console.log(`Using database ${dbuser}@${dbname} at ${dbhost}`);

export default mysql.createPool({
    host: dbhost,
    database: dbname,
    user: dbuser,
    password: dbpass,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 100,
    dateStrings: [
        'DATE',
        'DATETIME'
    ]
});
