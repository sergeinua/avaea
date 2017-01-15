/**
 * recaptcha
 * Google recaptcha service
 * @docs https://developers.google.com/recaptcha/docs/verify
 *
 */
/* global sails */
var request = require('request');

module.exports = {
  verify: function (params, cb) {
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" +
      params.secret + "&response=" + params.response
      // + "&remoteip=" + req.connection.remoteAddress
      ;
    request(verificationUrl, cb);
  },


};
