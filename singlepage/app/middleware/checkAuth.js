var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Check auth middleware
 *
 */

module.exports = function(req, res, next) {

    var _urls     = ['/api/auth', '/api/registration'],
        _headers  = req.headers,
        _token    = _headers.authorization,
        _isDevice = _headers.isdevice,
        _query    = 'select token from users where token=?';

    if(_urls.indexOf(req.url) == -1) {

        if((_isDevice === 'true') && !_.isEmpty(_token)) {

            req.getConnection(function(err, connection) {

                if (err) {
                    return next(err);
                }

                connection.query(_query, [_token], function (err, user) {

                    if (err) {
                        return next(err);
                    }

                    if(!_.size(user)) {
                        return next(401);
                    }

                    next();

                });

            });

        } else if(!req.session.user) {
            return next(401);
        } else if(req.session.user) {
            next();
        }

    } else {
        next();
    }

};