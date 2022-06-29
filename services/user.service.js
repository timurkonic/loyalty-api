import pool from '../db/pool.js';
import jsonwebtoken from 'jsonwebtoken';

class UserService {

    async login(id, pass) {
        const select_user = await pool.query('select id from account where id = ? and wpass = md5(?)', [id, pass]);
        if (select_user[0].length === 0)
            return {error: 'Неверный логин или пароль'};

        const user = { id: id };
        const token = jsonwebtoken.sign({ user: user }, process.env.JWTSECRET);
        return { token: token };
    }

}

export default new UserService();