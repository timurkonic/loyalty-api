import express from 'express';
import TransactionController from '../controllers/transaction.controller.js';

const router = express.Router();

router.post('/', TransactionController.createTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;