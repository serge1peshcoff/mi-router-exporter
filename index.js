const express = require('express');
const ejs = require('ejs');

const logger = require('./logger');
const morgan = require('./morgan');
const MiRouter = require('./MiRouter');

const router = new MiRouter({ url: process.env.URL, password: process.env.PASSWORD });

const server = express();
server.use(morgan);
server.get('/metrics', async (req, res) => {
    try {
        const stats = await router.status();
        logger.debug({ stats }, 'Stats from Mi Router');

        const data = await ejs.renderFile('./response.ejs', { stats });
        res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.end(data);
    } catch (err) {
        logger.error({ err }, 'Getting stats error');
        res.status(500).end(err.message);
    }
});

const port = 3030;
logger.info(`Server listening to ${port}, metrics exposed on /metrics endpoint`);
server.listen(port);
