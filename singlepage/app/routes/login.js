var User = require('../models/user').User;

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Auth user
 *
 */

exports.post = function(req, res, next) {
    User.authUser(req, res, next);
};