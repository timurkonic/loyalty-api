import express from 'express';
import bodyParser from 'body-parser';

import routes from './routes/index.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/api/v2/', routes);

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});
