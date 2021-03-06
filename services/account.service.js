import pool from '../db/pool.js';

class AccountService {

    async getAccount(id) {
        const select_account = await pool.query(`
            select a.id, a.balance, a.balance_bns, a.type, at.name as type_name, a.active, a.block, bt.name as block_name,
                a.owner_family_name, a.owner_first_name, a.owner_third_name, date_format(a.owner_birthday, '%d/%m/%Y') as owner_birthday, a.owner_phone, a.owner_email, a.owner_filled, a.discount,
                if (a.wpass is null, a.wtmpass, null) as wtmpass
            from account a
            left join account_type at on at.id = a.type
            left join block_type bt on bt.id = a.block
            where a.id = ?`, [id]);
        if (select_account[0].length === 0)
            return false;
        
        let account = select_account[0][0];

        const select_birthday = await pool.query('select account from action_birthday where start_dt <= curdate() and end_dt >= curdate() and account = ?', [id]);
        account['birthday_action'] = select_birthday[0].length > 0;

        // Add field for test
        if (id === '9900000175474') {
            account['receipt_phone'] = false;
            account['receipt_email'] = true;
        }

        return account;
    }

}

export default new AccountService();