'use strict';

let async = require('async');
let moment = require('moment');
let SMS_API = require('../../server/message');

module.exports = function (Transaction) {

  Transaction.report = function (from_date, to_date, cb) {
    var Client = Transaction.app.models.client;

    Client.find({}).then(function (clients) {
      clients = clients.reduce((obj, client) => {
        obj[client.id] = client;
        return obj;
      }, {})
      console.log(from_date, to_date);

      Transaction.find({
        where: {
          tdate: {
            between: [moment(from_date).toDate(),moment(to_date).toDate()]
          }
        }
      }).then(function (transactions) {

        let report = transactions.reduce(function (acc, transaction) {
          if (typeof acc[transaction.clientId] == 'undefined') {
            acc[transaction.clientId] = {
              total_amount: transaction.total_amount,
              commission_amount: transaction.commission_amount,
              payable_amount: transaction.payable_amount,
              credit: transaction.credit,
              paying_amount: transaction.paying_amount,
              client: clients[transaction.clientId],
            }
          } else {
            acc[transaction.clientId].total_amount += transaction.total_amount;
            acc[transaction.clientId].commission_amount += transaction.commission_amount;
            acc[transaction.clientId].payable_amount += transaction.payable_amount;
            acc[transaction.clientId].credit += transaction.credit;
            acc[transaction.clientId].paying_amount += transaction.paying_amount;
          }
          return acc;
        }, {});

        cb(null, report);
      })
    })
  };

  Transaction.remoteMethod("report", {
    http: {
      verb: "get"
    },
    accepts: [{
        arg: 'from_date',
        type: 'string',
        required: true
      },
      {
        arg: 'to_date',
        type: 'string',
        required: true
      }
    ],
    returns: {
      type: "object",
      root: true
    }
  });


  Transaction.dashboard = function (cb) {
    let report = [];

    var Client = Transaction.app.models.client;
    Client.find({}, function (err, clients) {
      async.eachSeries(clients, function (client, cb2) {
        let startD = moment().subtract(7, 'days').startOf('day').toDate();
        let endD = moment().subtract(7, 'days').endOf('day').toDate();
        let yesterday = moment().subtract(1, 'days').endOf('day').toDate();
        client.transactions.find({
          where: {
            tdate: {
              gte: startD,
              lte: endD
            }
          }
        }, function (err, transactions) {
          if (err) cb2();
          let creport = transactions.reduce(function (acc, tran) {
            acc.total += tran.total_amount;
            acc.payable += tran.payable_amount;
            acc.paid += tran.paying_amount;
            acc.balance = acc.paid - acc.payable;
            return acc;
          }, {
            total: 0,
            payable: 0,
            paid: 0,
            balance: 0,
            client: client
          })
          report.push(creport);
          cb2();
        })
      }, function (err) {
        if (err) cb(err);
        cb(null, report);
      });
    });

  };

  Transaction.remoteMethod("dashboard", {
    http: {
      verb: "get"
    },
    accepts: [],
    returns: {
      type: "array",
      root: true
    }
  });


  Transaction.sendmsg = function (mobile, message, cb) {
    SMS_API(mobile, message, cb);
  };

  Transaction.remoteMethod("sendmsg", {
    http: {
      verb: "get"
    },
    accepts: [{
      arg: 'mobile',
      type: 'string',
      required: true
    }, {
      arg: 'message',
      type: 'string',
      required: true
    }],
    returns: {
      type: "array",
      root: true
    }
  });

};
