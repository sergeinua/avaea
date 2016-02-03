var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET favorites method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _response = { courses : null, lectures : null, chapters : null },
            _query =  {
                courses  :  'SELECT f.fav_id, c.course_id, c.course_title, c.course_desc FROM favorites f ' +
                            'JOIN courses c ON c.course_id = f.course_id ' +
                            'WHERE f.user_id = ? order by c.course_title;',
                lectures :  'SELECT f.fav_id, c.course_id, c.course_title, l.lecture_id, l.lecture_title, l.lecture_desc ' +
                            'FROM favorites f ' +
                            'JOIN lectures l ON f.lecture_id = l.lecture_id ' +
                            'JOIN courses c ON c.course_id = l.course_id ' +
                            'WHERE f.user_id = ? order by l.lecture_title;',
                chapters :  'SELECT f.fav_id, c.course_id, c.course_title, l.lecture_id, l.lecture_title, ch.chapter_id, ch.chapter_title, ch.chapter_desc ' +
                            'FROM favorites f ' +
                            'join chapters ch on f.chapter_id = ch.chapter_id ' +
                            'JOIN lectures l ON ch.lecture_id = l.lecture_id ' +
                            'JOIN courses c ON c.course_id = l.course_id ' +
                            'WHERE f.user_id = ? order by ch.chapter_title;'
            };


        _query = _query.courses + _query.lectures + _query.chapters;

        connection.query(_query, [req._user.user_id, req._user.user_id, req._user.user_id], function (err, results) {

            if (err) {
                return next(err);
            }

            _response.courses = results[0];
            _response.lectures = results[1];
            _response.chapters = results[2];
            res.status(200).json(_response);

        });
    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add favorites method
 *
 */

exports.post = function(req, res, next) {

    if (_.isEmpty(req.body)) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params       = req.body,
            _itemType     = _params.item_type,
            _requestQuery = 'insert into favorites set ?',
            _checkQuery   = 'select * from favorites where user_id = ? and ' + _itemType + '_id = ?',
            _selectQuery  = 'select * from favorites where user_id = ? order by fav_id desc limit 1';
            delete _params.item_type;

        connection.query(_checkQuery, [req._user.user_id, _params[_itemType + '_id']], function (err, favorites) {

            if (err) {
                return next(err);
            }

            if (!favorites.length) {

                _params.user_id = req._user.user_id;

                connection.query(_requestQuery, [_params], function (err, insert) {

                    if (err) {
                        return next(err);
                    }

                    connection.query(_selectQuery, [req._user.user_id], function (err, _favorites) {

                        if (err) {
                            return next(err);
                        }

                        res.status(200).json(_favorites[0]);

                    });

                });
            } else {
                return next(304);
            }

        })

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Delete favorites method
 *
 */

exports.delete = function(req, res, next) {

    if (_.isEmpty(req.body)) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _requestQuery = 'delete from favorites where user_id = ? and fav_id = ?';

        connection.query(_requestQuery, [req._user.user_id, req.body.fav_id], function (err, deleted) {

            if (err) {
                return next(err);
            }

            res.status(200).json({});

        })

    });

};

