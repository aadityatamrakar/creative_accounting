'use strict';

let telegram = require('../../server/telegram');
let moment = require('moment');

module.exports = function (Slot) {

  Slot.observe('before save', function (ctx, next) {
    if (ctx.isNewInstance) {
    //   console.log(ctx);
      telegram('New Slot Booking: \nPages: ' + ctx.instance.page_names.join(', ') + '\nSlot Time: ' + moment(ctx.instance.bookdate, 'X').format('DD/MM/Y HH:mm A') + '\nComments: ' + ctx.instance.comments + '\nGap in mins: ' + ctx.instance.gap + '\nBooked By: ' + ctx.instance.client_name);
      next();
    }
  });


};
