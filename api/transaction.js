import pool from '../db/pool.js';
import currency from 'currency.js';

const post = async (req, res, next) => {
    const trns = req.body;
    const host = req.socket.remoteAddress;

    try {
        switch (trns.type) {
            case 'paybonus':
                return res.json(await paybonus(trns.account, trns.amount, host, trns.cassa, trns.chek_sn));
            default:
                return res.json({error: 'Неизвестный тип транзакции'});
        }
    }
    catch (e) {
        console.log(e);
        return res.json({error: "Internal error"});
    }
}

const paybonus = async (id, amount, host, cassa, chek_sn) => {
    if (amount <= 0)
        return {error: 'Неверная сумма списания'};

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const account_select = await pool.query('select balance, balance_bns, active, block, owner_filled from account where id = ?', [id]);

        if (account_select[0].length === 0)
            return {error: 'Карта не найдена'};
    
        const account = account_select[0][0];
    
        if (account.active === 0 || account.block !== 0)
            return {error: 'Карта заблокирована'};
    
        if (account.balance_bns < amount)
            return {error: 'Недосточный баланс'};
    
        const new_balance_bns = currency(account.balance_bns).subtract(amount).value;

        const select_now = await connection.query('select CURRENT_TIMESTAMP() as ts');
        const ts_now = select_now[0][0].ts;

        await connection.query('insert into transaction set ?', {
            account: id,
            ts: ts_now,
            type: 5,
            balance: account.balance,
            amount_bns: amount,
            balance_bns: new_balance_bns,
            host: host,
            cassa: cassa,
            chek_sn: chek_sn
        });

        await connection.query('update account set balance_bns = ? where id = ?', [new_balance_bns, id]);

        await connection.commit();

        const transaction_id = id + ts_now.toISOString().replaceAll(/\D/ig, '');
        return {transaction_id: transaction_id, new_balance_bns: new_balance_bns};
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