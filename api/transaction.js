import pool from '../db/pool.js';
import currency from 'currency.js';

const post = async (req, res, next) => {
    const trns = req.body;
    const host = req.socket.remoteAddress;

    try {
        switch (trns.type) {
            case 'paybonus':
                const pb = await paybonus(trns.account, trns.amount, host, trns.cassa, trns.chek_sn);
                return res.json(pb);
            default:
                return res.json({error: 'Неизвестный тип транзакции'});
        }
    }
    catch {e} {
        console.log(e);
        return res.json({error: "Internal error"});
    }
}

const paybonus = async (id, amount, host, cassa, chek_sn) => {
    if (amount <= 0)
        return {error: 'Неверная сумма списания'};

    const account_select = await pool.query('select balance, balance_bns, active, block, owner_filled from account where id = ?', [id]);

    if (account_select[0].length === 0)
        return {error: 'Карта не найдена'};

    const account = account_select[0][0];

    if (account.active === 0 || account.block !== 0)
        return {error: 'Карта заблокирована'};

    if (account.balance_bns < amount)
        return {error: 'Недосточный баланс'};

    const new_balance_bns = currency(account.balance_bns).subtract(amount);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query('insert into transaction set ?', {
            account: id,
            type: 5,
            balance: account.balance,
            amount_bns: amount,
            balance_bns: new_balance_bns,
            host: host,
            cassa: cassa,
            chek_sn: chek_sn
        });

        await connection.query('update account set balance_bns = balance_bns - ? where id = ?', [amount, id]);

        await connection.commit();
        return {new_balance_bns: new_balance_bns};
    }
    catch (e) {
        console.log(e);
        await connection.rollback();
        return {error: 'Internal error'};
    }
    finally {
        await connection.release();
    }
}

export default { post };