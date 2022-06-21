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
            return res.json({error: "Unknown transaction type"});
    }
}

const paybonus = (account, amount, cassa, chek_sn, cb) => {
    cb("Insufficient balance", null);
}


export default { post };