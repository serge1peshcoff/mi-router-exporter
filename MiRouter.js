const request = require('request-promise-native');
const crypto = require('crypto');
const getMAC = require('getmac');

const logger = require('./logger');

class MiRouter {
    constructor(params) {
        if (!params.password) {
            throw new Error('Password is not provided');
        }

        this.url = params.url || '192.168.31.1';
        this.password = params.password;

        this.publicKey = params.publicKey || 'a2ffa5c9be07488bbb04a3a47d3c5f6a';
        this.deviceId = params.deviceId || getMAC.default();
    }

    static sha1(data) {
        return crypto.createHash('sha1').update(data, 'binary').digest('hex');
    }

    createNonce() {
        const type = 0;
        const time = Math.floor(new Date().getTime() / 1000);
        const random = Math.floor(Math.random() * 10000);
        return [type, this.deviceId, time, random].join('_');
    }

    createPasswordHash(nonce, pwd) {
        return MiRouter.sha1(nonce + MiRouter.sha1(pwd + this.publicKey)).toString();
    }

    async login() {
        const nonce = this.createNonce();
        const password = this.createPasswordHash(nonce, this.password);

        const response = await request({
            url: `http://${this.url}/cgi-bin/luci/api/xqsystem/login`,
            method: 'POST',
            json: true,
            formData: {
                username: 'admin',
                password,
                logtype: 2,
                nonce
            },
            timeout: 5000,
        });

        this.loginResponse = response;
        this.token = response.token;
        return response;
    }

    async getStatus() {
        return request({
            url: `http://${this.url}/cgi-bin/luci/;stok=${this.token}/api/misystem/status`,
            json: true,
            timeout: 5000,
        });
    }

    async status() {
        if (!this.token) {
            logger.warn('No token set, logging in.');
            await this.login();
        }

        try {
            logger.info('Fetching status...');
            return await this.getStatus();
        } catch (err) {
            logger.error({ err }, 'Error fetching status, re-logging in...');
            await this.login();

            logger.info('Fetching status after relogin...');
            return this.getStatus();
        }
    }
}

module.exports = MiRouter;
