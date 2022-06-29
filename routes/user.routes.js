import express from 'express';
import UserController from '../controllers/user.controller.js';
import passport from '../middleware/passport.middleware.js';

const router = express.Router();

router.post("/login", UserController.login);
router.use(passport.authenticate('jwt', { session: false }));
router.get("/account", UserController.getAccount);

export default router;