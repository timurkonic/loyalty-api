import express from 'express';
import UserController from '../controllers/user.controller.js';
import passportAuth from '../middleware/passport.middleware.js';

const router = express.Router();

router.post("/login", UserController.login);
router.use(passportAuth);

router.get("/account", UserController.getAccount);
router.get("/transactions", UserController.getTransactions);

export default router;