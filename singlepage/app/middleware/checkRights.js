var parseBody = require('../lib/lib').parseBody,
    _         = require('lodash-node'),
    config    = require('../../config/config');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Check user rights middleware
 *
 */

module.exports = function(req, res, next) {

    var _urls = config.get('checkRights');

    if(req.method == 'GET' || _urls.indexOf(req.url) == -1) {
        return next();
    }

    var _headers    = req.headers,
        _parsedBody = parseBody(req.body),
        _error      = {
            connection : {
                status : 503,
                err    : "Connection database error."
            },
            sql        : {
                status : 503,
                err    : "SQL error."
            },
            noRights   : {
                status : 403,
                err    : "Can't perform an operation. You are have no rights."
            }
        };

    if(!_parsedBody) {
        return next();
    }

    req.getConnection(function(err, connection) {

        if (err) {
            err = _.merge(_error.connection, err);
            return next(err);
        }

        connection.query(_parsedBody.sql, [_parsedBody.val], function (err, results) {

            if (err) {
                err = _.merge(_error.sql, err);
                return next(err);
            }

            if(!results.length) {
                return next(_error.noRights);
            } else {

                if(_headers.isdevice === 'true') {

                    if(_headers.authorization != results[0].token) {
                        return next(_error.noRights);
                    }

                } else {

                    if(results[0].user_id != req.session.user.user_id) {
                        return next(_error.noRights);
                    }

                }

            }

            next();

        });

    });

};