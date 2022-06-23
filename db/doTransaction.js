import pool from './pool.js';

const doTransaction = async (f) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const result = f(connection);
        await connection.commit();
        return result;
    }
    catch (e) {
        console.log(e);
        await connection.rollback();
        throw (e);
    }
    finally {
        await connection.release();
    }
}

export default doTransaction;