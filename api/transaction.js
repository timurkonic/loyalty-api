import pool from '../db/pool.js';
import currency from 'currency.js';

const post = async (req, res, next) => {
    const trns = req.body;

    try {
        switch (trns.type) {
            case 'paybonus':
                const pb = await paybonus(trns.account, trns.amount, trns.cassa, trns.chek_sn);
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

const paybonus = async (id, amount, cassa, chek_sn) => {
    if (amount <= 0)
        return {error: 'Неверная сумма списания'};

    const account_select = await pool.query('select balance_bns, active, block, owner_filled from account where id = ?', [id]);

    if (account_select[0].length === 0)
        return {error: 'Карта не найдена'};

    const account = account_select[0][0];

    if (account.active === 0 || account.block !== 0)
        return {error: 'Карта заблокирована'};

    if (account.balance_bns < amount)
        return {error: 'Недосточный баланс'};

    const new_balance = currency(account.balance_bns).subtract(amount);

    return {new_balance: new_balance};
}

export default { post };