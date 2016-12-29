/**
 * RecaptchaController
 *
 * @description :: Server-side api of google recaptcha
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  verify: function (req, res) {
    console.log("Recaptcha controller verify method called");

    var token = req.param('recaptcha');
    var params = {
      response: token,
      secret: sails.config.recaptcha.private,
      // remoteip: req.connection.remoteAddress
    };
    recaptcha.verify(params, function (error,response,body) {
      body = JSON.parse(body);
      // Success will be true or false depending upon captcha validation.
      // if (!error && (response.statusCode == 200)) {
      if((body.success !== undefined) && !body.success) {
        return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
      }
      // send email
      res.json({"responseCode" : 0,"responseDesc" : "Success"});
    }
    );
  }
};

