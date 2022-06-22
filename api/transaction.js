import pool from '../db/pool.js';
import currency from 'currency.js';

const post = async (req, res, next) => {
    const trns = req.body;
    const host = req.socket.remoteAddress;

    if (trns.amount <= 0)
        return {error: 'Неверная сумма транзакции'};

    try {
        switch (trns.type) {
            case 'bonus':
                return res.json(await paybonus(trns.account, trns.amount, host, trns.cassa, trns.chek_sn));
            case 'ruble':
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

const del = async (req, res, next) => {
    const id = req.params.id;

    try {
        return res.json(await doTransaction(connection => rollback(connection, id)));
    }
    catch (e) {
        console.log(e);
        return res.json({error: "Internal error"});
    }
}


const payruble = async (id, amount, host, cassa, chek_sn) => {
    return doTransaction(connection => pay(connection, {
        id: id, 
        amount: amount,
        host: host,
        cassa: cassa,
        chek_sn: chek_sn,
        type: "ruble",
        transaction_type: 0
    }));
};

const paybonus = async (id, amount, host, cassa, chek_sn) => {
    return doTransaction(connection => pay(connection, {
        id: id, 
        amount: amount,
        host: host,
        cassa: cassa,
        chek_sn: chek_sn,
        type: "bonus",
        transaction_type: 5
    }));
};

const pay = async (connection, options) => {
    const account_select = await connection.query('select balance, balance_bns, active, block, owner_filled from account where id = ?', [options.id]);

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
        amount: - amount_ruble,
        balance_bns: new_balance_bonus,
        amount_bns: - amount_bonus,
        host: options.host,
        cassa: options.cassa,
        chek_sn: options.chek_sn
    });

    await connection.query('update account set balance = ?, balance_bns = ? where id = ?', [new_balance_ruble, new_balance_bonus, options.id]);

    const transaction_id = options.id + ts_now.replaceAll(/\D/ig, '');
    return {transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus};
}

const rollback = async (connection, transaction_id) => {
    const accountTs = extractAccountTs(transaction_id);

    const account_select = await connection.query('select balance, balance_bns from account where id = ?', [accountTs.account]);

    if (account_select[0].length === 0)
        return {error: 'Карта не найдена'};

    const account = account_select[0][0];

    const transaction_select = await connection.query('select amount, amount_bns from transaction where account = ? and ts = ?', [accountTs.account, accountTs.ts]);

    if (transaction_select[0].length === 0)
        return {error: 'Транзакция не найдена'};

    const transaction = transaction_select[0][0];

    const new_balance_ruble = currency(account.balance).subtract(transaction.amount).value;
    const new_balance_bonus = currency(account.balance_bns).subtract(transaction.amount_bns).value;

    await connection.query('delete from transaction where account = ? and ts = ?', [accountTs.account, accountTs.ts]);

    await connection.query('update account set balance = ?, balance_bns = ? where id = ?', [new_balance_ruble, new_balance_bonus, accountTs.account]);

    return {transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus};
}

const doTransaction = async (f) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const result = f(connection);
        await connection.commit();
        return result;
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


const extractAccountTs = (transaction_id) => {
    const account = transaction_id.substring(0, 13);
    const regex = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
    const da = regex.exec(transaction_id.substring(13)); 
    const ts = `${da[1]}-${da[2]}-${da[3]} ${da[4]}:${da[5]}:${da[6]}`;
    return {account: account, ts: ts};
}

export default { post, del };