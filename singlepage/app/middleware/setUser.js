var User = require('../models/user').User;

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Set user middleware
 *
 */

module.exports = function(req, res, next) {

    var _urls = ['/api/auth', '/api/registration'],
        _query = 'select user_id, token from users where token = ?',
        _token = null, _params = null;

    if(_urls.indexOf(req.url) == -1) {

        req.getConnection(function(err, connection) {

            if (err) {
                return next(err);
            }

            _token = req.headers.authorization || req.session.user.token;

            connection.query(_query, [_token], function (err, user) {

                if (err) {
                    return next(err);
                }

                req._user = user[0];
                next();

            });

        });

    } else {

        if('login' in req.body) {
            _query = 'select user_id, token from users where login = ? and password = ?';
            _params = [req.body.login, User.encryptPassword(req.body.password)];
        } else {
            _token = req.body.token || req.headers.authorization;
            _params = [_token];
        }

        req.getConnection(function(err, connection) {

            if (err) {
                return next(err);
            }

            connection.query(_query, _params, function (err, user) {

                if (err) {
                    return next(err);
                }

                req._user = user[0];
                next();

            });

        });

    }

};