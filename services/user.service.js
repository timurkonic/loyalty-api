import pool from '../db/pool.js';

class UserService {

    async login(id, pass) {
        return {ok: 'ok'};
    }

}

export default new UserService();