import AccountService from '../services/account.service.js';
import logger from '../logger/logger.js';

class AccountController {

    async getAccount(req, res) {
        try {
            const id = req.params.id;
            logger.debug({f: 'getAccount', id: id});
            const result = await AccountService.getAccount(id);
            logger.debug({f: 'getAccount', result: result});
            if (!result)
                return res.status(404).json({ error: 'Карта не найдена' });
                return res.json(result);
        }
        catch (e) {
            logger.error(e);
            return res.status(500).json({error: "Internal error"});
        }
    }

}

export default new AccountController();