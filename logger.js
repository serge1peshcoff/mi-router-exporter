const bunyan = require('bunyan');

const packageInfo = require('./package');

const logger = bunyan.createLogger({
    name: packageInfo.name,
    level: process.env.LOGLEVEL || 'warn'
});

module.exports = logger;
