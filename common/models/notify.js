'use strict';

const request = require('request');

module.exports = function (Notify) {
    Notify.sendMessage = function (message, channel, cb) {
        let config = Notify.app.get('telegram');
        let channels = Notify.app.get('channels');
        if (typeof channel != 'undefined') {
            channel = channels[channel];
        } else {
            channel = channels[0];
        }
        console.time('notify');
        let options = {
            method: "GET",
            url: `https://api.telegram.org/bot${config.key}/sendMessage?parse_mode=HTML&chat_id=${channel.channelId?channel.channelId:channel.channel}&text=${message}`,
            gzip: true,
            headers: {
                "Connection": "keep-alive"
            }
        }
        request.get(options, function (err, resp, body) {
            console.timeEnd('notify')
            if (err) {
                cb(err);
            } else {
                console.log(body);
                cb(null, {
                    status: true
                });
            }
        })

    };

    Notify.remoteMethod("sendMessage", {
        http: {
            verb: "post"
        },
        accepts: [{
            arg: 'message',
            type: 'string',
            required: true
        }, {
            arg: 'channel',
            type: 'number',
            required: false
        }],
        returns: {
            type: "object",
            root: true
        }
    });
};