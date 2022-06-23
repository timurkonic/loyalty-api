import express from 'express';
import AccountController from '../controllers/account.controller.js';

const router = express.Router();

router.get("/:id", AccountController.getAccount);

export default router;