import TransactionService from '../services/transaction.service.js';
import logger from '../logger/logger.js';

class TransactionController {

    async createTransaction(req, res) {
        try {
            const trns = req.body;
            const host = req.socket.remoteAddress;

            logger.debug({f: 'createTransaction', trns: trns, host: host});
            const result = await TransactionService.createTransaction({...trns, host: host});
            logger.debug({f: 'createTransaction', result: result});

            if (result && result.error)
                return res.status(400).json(result);
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            logger.error(e.message);
            return res.status(500).json({error: "Internal error"});
        }
    }

    async deleteTransaction(req, res) {
        try {
            const id = req.params.id;

            logger.debug({f: 'deleteTransaction', id: id});
            const result = await TransactionService.deleteTransaction(id);
            logger.debug({f: 'deleteTransaction', result: result});

            if (result.error)
                return res.status(400).json(result);
            return res.json(result);
        }
        catch (e) {
            console.log(e);
            logger.error(e.message);
            return res.status(500).json({error: "Internal error"});
        }
    }

}

export default new TransactionController();