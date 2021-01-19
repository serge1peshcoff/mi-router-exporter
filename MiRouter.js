const request = require('request-promise-native');
const crypto = require('crypto');

class MiRouter {
    constructor(params) {
        if (!params.password) {
            throw new Error('Password is not provided');
        }

        this.url = params.url || '192.168.31.1';
        this.password = params.password;

        this.publicKey = params.publicKey || 'a2ffa5c9be07488bbb04a3a47d3c5f6a';
        this.deviceId = params.deviceId || 'f0:18:98:4e:6f:fe';
    }

    sha1(data) {
        return crypto.createHash('sha1').update(data, 'binary').digest('hex');
    }

    createNonce() {
        const type = 0;
        const time = Math.floor(new Date().getTime() / 1000);
        const random = Math.floor(Math.random() * 10000);
        return [type, this.deviceId, time, random].join('_');
    }

    createPasswordHash(nonce, pwd) {
        return this.sha1(nonce + this.sha1(pwd + this.publicKey)).toString();
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
        return response;
    }

    async status() {
        const loginBody = await this.login();
        const response = await request({
            url: `http://${this.url}/cgi-bin/luci/;stok=${loginBody.token}/api/misystem/status`,
            json: true,
            timeout: 5000,
        });
        return response;
    }
}

module.exports = MiRouter;
