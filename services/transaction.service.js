import doTransaction from '../db/doTransaction.js';
import pool from '../db/pool.js';
import currency from 'currency.js';
import logger from '../logger/logger.js';

class TransactionService {

    async createTransaction(trns) {
        if (trns.amount <= 0)
            return {error: 'Неверная сумма транзакции'};

        const options = this.getTransactionOptions(trns);
        if (!options)
            return {error: 'Неизвестный тип транзакции'};
        
        return await doTransaction(connection => this.dbCreateTransaction(connection, options));
    }

    getTransactionOptions(trns) {
        switch (trns.type) {
            case 'addbonus':
                return {
                    ...trns,
                    type: "bonus",
                    transaction_type: 4,
                    checkBalance: false,
                    checkBlock: false,
                    checkOwnerFilled: false,
                    checkPassword: false
                };
            case 'addruble':
                return {
                    ...trns,
                    type: "ruble",
                    transaction_type: 1,
                    checkBalance: false,
                    checkBlock: false,
                    checkOwnerFilled: false,
                    checkPassword: false
                };
            case 'paybonus':
                return {
                    ...trns,
                    amount: - trns.amount,
                    type: "bonus",
                    transaction_type: 5,
                    checkBalance: true,
                    checkBlock: true,
                    checkOwnerFilled: true,
                    checkPassword: false
                };
            case 'payruble':
                return {
                    ...trns,
                    amount: - trns.amount,
                    type: "ruble",
                    transaction_type: 0,
                    checkBalance: true,
                    checkBlock: true,
                    checkOwnerFilled: false,
                    checkPassword: true
                };
            case 'retruble':
                return {
                    ...trns,
                    type: "ruble",
                    transaction_type: 0,
                    checkBalance: false,
                    checkBlock: false,
                    checkOwnerFilled: false,
                    checkPassword: true
                };
            default:
                return false;
        }

    }

    async deleteTransaction(id) {
        return await doTransaction(connection => this.dbDeleteTransaction(connection, id));
    }

    async dbCreateTransaction (connection, options) {
        const account_select = await connection.query('select balance, balance_bns, active, block, owner_filled, pass from account where id = ?', [options.account]);
    
        if (account_select[0].length === 0)
            return {error: 'Карта не найдена'};
    
        const account = account_select[0][0];
    
        if (options.checkBlock && (account.active === 0 || account.block !== 0))
            return {error: 'Карта заблокирована'};
    
        if (options.checkOwnerFilled && account.owner_filled === 0)
            return {error: 'Карта не активирована'};
    
        const amount_ruble = options.type === "ruble" ? options.amount : 0;
        const amount_bonus = options.type === "bonus" ? options.amount : 0;
    
        const new_balance_ruble = currency(account.balance).add(amount_ruble).value;
        const new_balance_bonus = currency(account.balance_bns).add(amount_bonus).value;
    
        if (options.checkBalance && (new_balance_ruble < 0 || new_balance_bonus < 0))
            return {error: 'Недосточный баланс'};

        if (options.checkPassword && (options.pass !== account.pass))
            return {error: 'Неверный пароль'};

        const ts_now = await this.getCurrentTs(connection, options.account);
    
        await connection.query('insert into transaction set ?', {
            account: options.account,
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
        await connection.query('update account set balance = ?, balance_bns = ? where id = ?', [new_balance_ruble, new_balance_bonus, options.account]);

        const transaction_id = this.getTransactionId(options.account, ts_now);

        logger.info({f: 'dbCreateTransaction', ...options, transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus});

        return {transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus};
    }

    async getCurrentTs(connection, account) {
        let dt = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
        do {
            let select_check = await connection.query('select account from transaction where account = ? and ts = ?', [account, this.convertToTs(dt)]);
            if (!select_check[0][0])
                return this.convertToTs(dt);
            dt.setSeconds(dt.getSeconds() + 1);
        }
        while (true);
    }

    convertToTs(dt) {
        return dt.toISOString().slice(0, 19).replace('T', ' ');
    }

    async dbDeleteTransaction(connection, transaction_id) {
        const accountTs = this.parseTransactionId(transaction_id);

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
    
        logger.info({f: 'dbDeleteTransaction', transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus});

        return {transaction_id: transaction_id, new_balance: new_balance_ruble, new_balance_bns: new_balance_bonus};
    }

    async getTransactions(account) {
        const transaction_select = await pool.query(`
            select t.ts, t.type, tt.name, t.amount, t.balance, t.amount_bns, t.balance_bns
            from transaction t
            join transaction_type tt on tt.id = t.type
            where t.account = ?
            order by t.ts`, [account]);
    
        return transaction_select[0];
    }
    
    getTransactionId(account, ts) {
        return account + ts.replaceAll(/\D/ig, '');
    }
    
    parseTransactionId(transaction_id) {
        const account = transaction_id.substring(0, 13);
        const regex = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
        const da = regex.exec(transaction_id.substring(13)); 
        const ts = `${da[1]}-${da[2]}-${da[3]} ${da[4]}:${da[5]}:${da[6]}`;
        return {account: account, ts: ts};
    }

}

export default new TransactionService();