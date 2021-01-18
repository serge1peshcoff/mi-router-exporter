const bunyan = require('bunyan');

const packageInfo = require('./package');

const logger = bunyan.createLogger({
    name: packageInfo.name,
    level: process.env.LOGLEVEL || 'info'
});

module.exports = logger;