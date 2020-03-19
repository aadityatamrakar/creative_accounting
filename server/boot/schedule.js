'use strict';

let SMS_API = require('../message');
var CronJob = require('cron').CronJob;

module.exports = function enableAuthentication(server) {
  var Client = server.models.client;

  function remind() {
    Client.find({
      where: {
        mobile: {
          exists: true
        }
      }
    }, function (err, clients) {
      clients.forEach(function (client) {
        let msg = 'Hey ' + client.name + '! Upload daily report now on Creative Fuel portal.';
        SMS_API(client.mobile, msg, (err, res) => {
          console.log('message sent', client.name, res);
        });
      });
    });
  }

  var job = new CronJob('0 0 23 * * *', remind, null, true, 'Asia/Kolkata');
  job.start();

  // remind();
};
