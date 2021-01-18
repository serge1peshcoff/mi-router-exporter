const express = require('express');
const ejs = require('ejs');

const logger = require('./logger');
const morgan = require('./morgan');
const MiRouter = require('./MiRouter');

const server = express();
server.use(morgan);
server.get('/metrics', async (req, res) => {
    const router = new MiRouter({ password: process.env.PASSWORD });
    const stats = await router.status();
    logger.debug({stats}, 'Stats from Mi Router');

    const data = await ejs.renderFile('./response.ejs', { stats });
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.end(data);
});

const port = 3000;
logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`);
server.listen(port);