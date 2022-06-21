import pool from '../db/pool.js';

const get = (req, res, next) => {
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
}

export default { get };