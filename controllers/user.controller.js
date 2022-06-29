import UserService from '../services/user.service.js';
import AccountService from '../services/account.service.js';
import TransactionService from '../services/transaction.service.js';
import logger from '../logger/logger.js';

class UserController {

    async login(req, res) {
        try {
            const id = req.body.id;
            const pass = req.body.pass;
            logger.debug({f: 'login', id: id});
            const result = await UserService.login(id, pass);
            logger.debug({f: 'login', result: result});
            if (!result)
                return res.status(404).json({ error: 'Ошибка аутентификации' });
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            logger.error(e.message);
            return res.status(500).json({error: "Internal error"});
        }
    }

    async getAccount(req, res) {
        try {
            const id = req.user.id;
            logger.debug({f: 'getAccount', id: id});
            const result = await AccountService.getAccount(id);
            logger.debug({f: 'getAccount', result: result});
            if (!result)
                return res.status(404).json({ error: 'Карта не найдена' });
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            logger.error(e.message);
            return res.status(500).json({error: "Internal error"});
        }
    }

    async getTransactions(req, res) {
        try {
            const id = req.user.id;
            logger.debug({f: 'getTransactions', id: id});
            const result = await TransactionService.getTransactions(id);
            if (!result)
                return res.status(404).json({ error: 'Карта не найдена' });
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            logger.error(e.message);
            return res.status(500).json({error: "Internal error"});
        }

    }

}

export default new UserController();