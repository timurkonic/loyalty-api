import TransactionService from '../services/transaction.service.js';

class TransactionController {

    async createTransaction(req, res) {
        try {
            const trns = req.body;
            const host = req.socket.remoteAddress;

            const result = await TransactionService.createTransaction({...trns, host: host});
            if (result && result.error)
                return res.status(400).json(result);
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({error: "Internal error"});
        }
    }

    async deleteTransaction(req, res) {
        try {
            const id = req.params.id;

            const result = await TransactionService.deleteTransaction(id);
            if (result.error)
                return res.status(400).json(result);
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            return res.status(500).json({error: "Internal error"});
        }
    }

}

export default new TransactionController();