/* global passport */
/**
 * bearerAuth Policy
 *
 * Policy for authorizing API requests. The request is authenticated if the
 * it contains the accessToken in header, body or as a query param.
 * Unlike other strategies bearer doesn't require a session.
 * Add this policy (in config/policies.js) to controller actions which are not
 * accessed through a session. For example: API request from another client
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = function (req, res, next) {

  if (req.session.authenticated || req.user) {
    return next();
  }

  passport.authenticate('bearer', {session: false}, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
      return next();
    }
    return res.redirect('/login');
  })(req, res);
};
