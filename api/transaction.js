import pool from '../db/pool.js';

const post = (req, res, next) => {
    const trns = req.body;

    switch (trns.type) {
        case 'paybonus':
            paybonus(trns.account, trns.amount, trns.cassa, trns.chek_sn, (err, ret) => {
                if (err)
                    return res.json({error: err});
                return res.json(ret);
            });
            break;
        default:
            return res.json({error: 'Неизвестный тип транзакции'});
    }
}

const paybonus = (account, amount, cassa, chek_sn, cb) => {
    if (amount <= 0)
        return cb('Неверная сумма списания', null);

    pool.query('select balance_bns, active, block, owner_filled from account where id = ?', [account], (err, rows) => {
        if (err) {
            console.log(err);
            return cb('Internal error', null);
        }

        if (rows.length === 0)
            return cb('Карта не найдена', null);

        if (rows[0].active === 0 || rows[0].block !== 0)
            return cb('Карта заблокирована', null);

        if (rows[0].balance_bns < amount)
            return cb('Недосточный баланс', null);

        const new_balance = Math.round(rows[0].balance_bns - amount, 2);

        return cb(false, {new_balance: new_balance});
    });
}


export default { post };