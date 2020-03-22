var request = require("request");

function sendMessage(message, cb) {
  let config = {
    key: '1085855608:AAEuQIFsAMh821iVbxm78OTdoH7uLZk6vaw'
  };
  let channel = {
    channelId: '-1001261878932',
    channel: '@cfpweb'
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
      if (cb) cb(err);
    } else {
      console.log(body);
      if (cb) {
        cb(null, {
          status: true
        });
      }
    }
  })

};

module.exports = sendMessage;