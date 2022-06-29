import pool from '../db/pool.js';
import jsonwebtoken from 'jsonwebtoken';

class UserService {

    async login(id, pass) {
        const select_user = await pool.query('select id from account where id = ? and wpass = md5(?)', [id, pass]);
        if (select_user[0].length === 0)
            return {error: 'Неверный логин или пароль'};

        const user = { id: id };
        const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // 30 days
        const token = jsonwebtoken.sign({ user: user, exp: exp}, process.env.JWTSECRET);
        return { token: token };
    }

}

export default new UserService();