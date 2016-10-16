/**
 * Passport Middleware
 *
 * Policy for Sails that initializes Passport.js and as well as its built-in
 * session support.
 *
 * In a typical web application, the credentials used to authenticate a user
 * will only be transmitted during the login request. If authentication
 * succeeds, a session will be established and maintained via a cookie set in
 * the user's browser.
 *
 * Each subsequent request will not contain credentials, but rather the unique
 * cookie that identifies the session. In order to support login sessions,
 * Passport will serialize and deserialize user instances to and from the
 * session.
 *
 * For more information on the Passport.js middleware, check out:
 * http://passportjs.org/guide/configure/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
module.exports = function (req, res, next) {
  // Initialize Passport
  passport.initialize()(req, res, function () {
    var ua = req.get('user-agent');
    console.log('User Agent:', ua);
    req.isMobile = res.locals.isMobile = /mobile/i.test(ua);
    req.showUnsupportedAlert = res.locals.showUnsupportedAlert = !/Chrome/i.test(ua);
    req.mobileDevice = res.locals.mobileDevice = null;
    if (req.isMobile) {
      if (/iPhone|iPad|iPod/i.test(ua)) {
        req.mobileDevice = res.locals.mobileDevice = 'ios';
      } else if (/Android/i.test(ua)) {
        req.mobileDevice = res.locals.mobileDevice = 'android';
      }
    }

    // Use the built-in sessions
    passport.session()(req, res, function () {
      // Make the user available throughout the frontend
      res.locals.user = req.user;
      next();
    });
  });
};
