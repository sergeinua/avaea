
var qpromice = require('q');
var nodemailer = require('nodemailer');

module.exports = {
  // Send mail
  sendMail: function (fromField, toField, subjectField, textHtml, textPlain) {
    var qdefer = qpromice.defer();

    var params = {
      to: toField,
      subject: subjectField,
    };
    if (textHtml) {
      params.html = textHtml;
    } else {
      params.text = textPlain;
    }
    params.from = fromField ? fromField : sails.config.email.from;

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