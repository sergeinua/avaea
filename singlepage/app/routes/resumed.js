var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET resumed method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _query = 'select chapter_id, offset from user_resumed where user_id = ? and lecture_id = ?';

        connection.query(_query, [req._user.user_id, req.params.lecture_id], function (err, results) {

            if (err) {
                return next(err);
            }

            if (results.length) {
                res.status(200).json(results[0]);
            } else {
                res.status(200).json({});
            }

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add resumed method
 *
 */

exports.post = function(req, res, next) {

    if (_.isEmpty(req.body) || !('lecture_id' in req.body && 'chapter_id' in req.body && 'offset' in req.body)) {
        return next({ status : 400, error: 'Invalid data set for the resumed record' });
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params       = req.body,
            _requestQuery = 'replace into user_resumed set ?',
            _selectQuery  = 'select lecture_id, chapter_id, offset from user_resumed where lecture_id=? and user_id=?',
            _setParams    = {
                lecture_id  : _params.lecture_id,
                chapter_id  : _params.chapter_id,
                offset      : _params.offset,
                user_id     : req._user.user_id
            };

        connection.query(_requestQuery, _setParams, function (err, results) {

            if (err) {
                return next(err);
            }

            connection.query(_selectQuery, [_setParams.lecture_id, req._user.user_id], function (err, _results) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(_results[0]);

            });

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Delete resumed method
 *
 */

exports.delete = function(req, res, next) {

    if (_.isEmpty(req.body) || !('lecture_id' in req.body)) {
        return next({ status : 400, error: 'Invalid data set for the resumed record' });
    }

    req.getConnection(function (err, connection) {

        if (err) {
            return next(err);
        }

        var _selectQuery = 'delete from user_resumed where user_id = ? and lecture_id = ?';

        connection.query(_selectQuery, [req._user.user_id, req.body.lecture_id], function (err, deleted) {

            if (err) {
                return next(err);
            }

            res.status(200).json({});
        });

    });

};