import express from 'express';

import userRoutes from './user.routes.js';
import accountRoutes from './account.routes.js';
import transactionRoutes from './transaction.routes.js';
import apikey from '../middleware/apikey.middleware.js';

const router = express.Router();

router.use('/user', userRoutes);
router.use(apikey);
router.use('/account', accountRoutes);
router.use('/transaction', transactionRoutes);

export default router;