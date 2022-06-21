const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');

const mysql = require('mysql2');

const dbhost = process.env.DBHOST || 'localhost';
const dbname = process.env.DBNAME || 'loyalty';
const dbuser = process.env.DBUSER || 'loyalty';
const dbpass = process.env.DBPASS || 'password';

console.log(`Using database ${dbuser}@${dbname} at ${dbhost}`);

const pool = mysql.createPool({
    host: dbhost,
    database: dbname,
    user: dbuser,
    password: dbpass,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/', router);

router.get('/', (req, res) => {
    res.send("Hello world");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
