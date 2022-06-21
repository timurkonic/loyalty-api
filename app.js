import express from 'express';
import bodyParser from 'body-parser';

import account from './api/account.js'

const app = express();
const router = express.Router();

const checkApiKey = (req, res, next) => {
    if (req.get('X-API-Key') !== process.env.APIKEY)
        res.status(401).json({error: 'unauthorised'});
    else
        next();
}

const processError = (err, req, res, next) => {
    if (err)
        return res.json({error: err.message || 'Unknown error'});
};

app.use(checkApiKey);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api/v1/', router);
app.use(processError);

router.get('/account/:id', account.get);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
