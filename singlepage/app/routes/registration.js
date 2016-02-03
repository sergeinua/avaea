var User = require('../models/user').User;

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Registration of user
 *
 */


exports.post = function(req, res, next) {
    User.chekUniqAndSave(req.body, req, res, next);
};