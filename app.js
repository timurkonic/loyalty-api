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
    connectionLimit: 20,
    queueLimit: 0
});

const processError = (err, req, res, next) => {
    if (err)
        return res.json({error: err.message || 'Unknown error'});
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/', router);
app.use(processError);

router.get('/account/:id', (req, res, next) => {
    const id = req.params.id;
    const result = pool.query(`
        select a.id, a.balance, a.balance_bns, a.type, at.name as type_name, a.active, a.block, bt.name as block_name,
            a.owner_family_name, a.owner_first_name, a.owner_third_name, date_format(a.owner_birthday, '%d/%m/%Y') as owner_birthday, a.owner_phone, a.owner_email, a.discount
        from account a
        left join account_type at on at.id = a.type
        left join block_type bt on bt.id = a.block
        where a.id = ?`, [id], (err, rows) => {
        if (err) {
            console.log(err);
            return next({ error: 'Internal error' });
        }

        if (rows.length === 0)
            return res.json({ error: 'Account not found' });

        return res.json(rows[0]);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
