var request = require("request");

function sendMessage(mobile, message, cb) {

  var options = {
    method: 'GET',
    url: 'https://api.msg91.com/api/sendhttp.php',
    qs: {
      // authkey: '144918Atzz5Ku8HHn5e739f13P1',
      authkey: '144918AWSSfyQRx5e73c148P1',
      mobiles: mobile,
      country: '91',
      message: message,
      sender: 'CFTEAM',
      route: '4'
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    cb(null, body);
  });

}

module.exports = sendMessage;
