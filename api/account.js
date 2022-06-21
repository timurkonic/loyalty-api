import pool from '../db/pool.js';

const get = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await pool.query(`
            select a.id, a.balance, a.balance_bns, a.type, at.name as type_name, a.active, a.block, bt.name as block_name,
                a.owner_family_name, a.owner_first_name, a.owner_third_name, date_format(a.owner_birthday, '%d/%m/%Y') as owner_birthday, a.owner_phone, a.owner_email, a.discount,
                if (a.wpass is null, a.wtmpass, null) as wtmpass
            from account a
            left join account_type at on at.id = a.type
            left join block_type bt on bt.id = a.block
            where a.id = ?`, [id]);
            
        if (result[0].length === 0)
            return res.json({ error: 'Карта не найдена' });
    
        return res.json(result[0][0]);
    }
    catch (e) {
        console.log(e);
        return res.json({error: "Internal error"});
    }
}

export default { get };