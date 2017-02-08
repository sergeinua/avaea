/**
 * FeedbackController
 *
 * @description :: Server-side api of google recaptcha
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var validator = require('validator');

module.exports = {
  verify: function (req, res) {
    var token = req.param('recaptcha');
    var name =  req.param('name');
    var email =  req.param('email');
    var replyTo = email && validator.isEmail(email) ? email : '';
    var comment =  req.param('comment');

    var params = {
      response: token,
      secret: sails.config.recaptcha.private,
      remoteip: req.connection.remoteAddress
    };
    recaptcha.verify(params, function (error,response,body) {
      body = JSON.parse(body);
      // Success will be true or false depending upon captcha validation.
      if(!body || ((body.success !== undefined) && !body.success)) {
        return res.json({
          error : true,
          errorMsg: "Failed captcha verification"
        });
      }
      // send email
      var emailParams = {
        to: sails.config.feedback.contactFeedbackEmail,
        from: sails.config.feedback.fromEmail,
        replyTo: replyTo,
        subject: 'Feedback from: "' + name + '"'
      };
      return Mailer.sendMail(emailParams, null, comment)
        .then(function () {
          return res.json({"responseCode" : 0,"responseDesc" : "Success"});
        }).catch(function (error) {
          onvoya.log.error(error);
          console.log('Error: Can\'t send email:', error, emailParams, comment);
          return res.ok({
            error: true,
            errorMsg: 'Something went wrong.'
          });
        });
        }
    );
  }
};

