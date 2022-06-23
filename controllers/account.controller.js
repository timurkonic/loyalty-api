import AccountService from '../services/account.service.js';

class AccountController {

    async getAccount(req, res) {
        try {
            const id = req.params.id;
            const result = await AccountService.getAccount(id);
            if (!result)
                return res.status(404).json({ error: 'Карта не найдена' });
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({error: "Internal error"});
        }
    }

}

export default new AccountController();