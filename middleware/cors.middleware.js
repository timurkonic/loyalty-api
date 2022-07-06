import cors from 'cors';

const corsOptions = {
    origin: 'http://172.31.1.50:3000',
    optionsSuccessStatus: 200
}

export default cors(corsOptions);