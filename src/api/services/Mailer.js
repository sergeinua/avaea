
var qpromice = require('q');
var nodemailer = require('nodemailer');

module.exports = {
  // Send mail
  sendMail: function (msgFields, textHtml, textPlain) {
    var qdefer = qpromice.defer();

    var params = msgFields;
    if (textHtml) {
      params.html = textHtml;
    } else {
      params.text = textPlain;
    }
    params.from = typeof params.from != 'undefined' ? params.from : sails.config.email.from;
    params.replyTo = typeof params.replyTo != 'undefined' ? params.replyTo : sails.config.email.replyTo;

    var _transport = nodemailer.createTransport(sails.config.email.smtp);

    _transport.sendMail(params, function (err, res) {
      if (err) {
        sails.log.error(err);
        qdefer.reject(err);
      } else {
        qdefer.resolve(res);
      }
    });

    return qdefer.promise;
  },

  // Make mail using template
  makeMailTemplate: function (tplName, tplVars) {
    var qdefer = qpromice.defer();

    sails.hooks.views.render("emails/"+tplName, tplVars, function(err, html) {
      if (err) {
        sails.log.error(err);
        qdefer.reject(err);
      } else {
        qdefer.resolve(html);
      }
    });

    return qdefer.promise;
  },
};