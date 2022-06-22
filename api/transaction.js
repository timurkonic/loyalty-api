import pool from '../db/pool.js';
import currency from 'currency.js';

const post = async (req, res, next) => {
    const trns = req.body;
    const host = req.socket.remoteAddress;

    if (trns.amount <= 0)
        return {error: 'Неверная сумма транзакции'};

    try {
        switch (trns.type) {
            case 'paybonus':
                return res.json(await paybonus(trns.account, trns.amount, host, trns.cassa, trns.chek_sn));
            case 'payruble':
                return res.json(await payruble(trns.account, trns.amount, host, trns.cassa, trns.chek_sn));
            default:
                return res.json({error: 'Неизвестный тип транзакции'});
        }
    }
    catch (e) {
        console.log(e);
        return res.json({error: "Internal error"});
    }
}

const payruble = async (id, amount, host, cassa, chek_sn) => {
    return pay({
        id: id, 
        amount: amount,
        host: host,
        cassa: cassa,
        chek_sn: chek_sn,
        type: "ruble",
        transaction_type: 0
    });
};

const paybonus = async (id, amount, host, cassa, chek_sn) => {
    return pay({
        id: id, 
        amount: amount,
        host: host,
        cassa: cassa,
        chek_sn: chek_sn,
        type: "bonus",
        transaction_type: 5
    });
};

const pay = async (options) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const account_select = await pool.query('select balance, balance_bns, active, block, owner_filled from account where id = ?', [options.id]);

        if (account_select[0].length === 0)
            return {error: 'Карта не найдена'};
    
        const account = account_select[0][0];
    
        if (account.active === 0 || account.block !== 0)
            return {error: 'Карта заблокирована'};

        const amount_ruble = options.type === "ruble" ? options.amount : 0;
        const amount_bonus = options.type === "bonus" ? options.amount : 0;
    
        if (account.balance < amount_ruble || account.balance_bns < amount_bonus)
            return {error: 'Недосточный баланс'};
    
        const new_balance_ruble = currency(account.balance).subtract(amount_ruble).value;
        const new_balance_bonus = currency(account.balance_bns).subtract(amount_bonus).value;

        const select_now = await connection.query('select CURRENT_TIMESTAMP() as ts');
        const ts_now = select_now[0][0].ts;

        await connection.query('insert into transaction set ?', {
            account: options.id,
            ts: ts_now,
            type: options.transaction_type,
            balance: new_balance_ruble,
            amount: amount_ruble,
            balance_bns: new_balance_bonus,
            amount_bns: amount_bonus,
            host: options.host,
            cassa: options.cassa,
            chek_sn: options.chek_sn
        });

        await connection.query('update account set balance = ?, balance_bns = ? where id = ?', [new_balance_ruble, new_balance_bonus, options.id]);

        await connection.commit();

        const transaction_id = options.id + ts_now.toISOString().replaceAll(/\D/ig, '');
        return {transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus};
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