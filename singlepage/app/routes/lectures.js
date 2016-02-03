var removeStructure = require('../lib/lib').removeStructure,
    _               = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET lectures method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        var params       = req.params,
            query        = '',
            paramsArray  = null,
            requestQuery = {
                course_id : 'select l.lecture_id, l.lecture_title, l.lecture_desc, l.published, l.last_modified, c.course_id, c.course_title ' +
                            'from lectures l, courses c where l.course_id=c.course_id and l.course_id=? order by l.lecture_title',
                user_id   : 'select * from lectures where course_id=? and user_id=? order by lecture_title'
            };

        if (err) {
            return next(err);
        }

        if(_.size(params) > 1) {
            query = requestQuery.user_id;
            paramsArray = [params.course_id, params.user_id];
        } else {
            query = requestQuery.course_id;
            paramsArray = [params.course_id];
        }

        connection.query(query, paramsArray, function (err, lectures) {

            if (err) {
                return next(err);
            }

            res.status(200).json(lectures);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add lecture method
 *
 */

exports.post = function(req, res, next) {

    if (_.isEmpty(req.body) && !('course_id' in req.body)) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params        = req.body,
            _requestQuery  = 'insert into lectures set ?',
            _selectQueries = 'select l.*, c.* from lectures l, courses c ' +
                             'where l.course_id = c.course_id and l.lecture_id = ? order by l.lecture_title',
            _setParams     = {
                course_id     : _params.course_id,
                lecture_title : _params.lecture_title,
                lecture_desc  : _params.lecture_desc,
                last_modified : new Date()
            };

        connection.query(_requestQuery, _setParams, function (err, lecture) {

            if (err) {
                return next(err);
            }

            connection.query(_selectQueries, [lecture.insertId], function (err, _lecture) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(_lecture[0]);

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
 * Update lecture method
 *
 */

exports.put = function(req, res, next) {

    if (_.isEmpty(req.body) && !('lecture_id' in req.body)) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params           = req.body,
            _lectureSet       = {},
            _updateQuery      = 'update lectures set ? where lecture_id = ?',
            _selectQuery      = 'select l.lecture_id, l.lecture_title, l.lecture_desc, l.published, l.last_modified, c.course_id, ' +
                                'c.course_title from lectures l, courses c ' +
                                'where l.course_id = c.course_id and l.lecture_id = ?';

        if(_params.lecture_title || _params.lecture_desc) {
            _params.lecture_title && (_lectureSet.lecture_title = _params.lecture_title);
            _params.lecture_desc && (_lectureSet.lecture_desc = _params.lecture_desc);
        }

        connection.query(_selectQuery, [_params.lecture_id], function (err, lecture) {

            if (err) {
                return next(err);
            }

            connection.query(_updateQuery, [_lectureSet, _params.lecture_id], function (err, updated) {

                if (err) {
                    return next(err);
                }

                lecture = lecture[0];
                _params.lecture_title && (lecture.lecture_title = _params.lecture_title);
                _params.lecture_desc && (lecture.lecture_desc = _params.lecture_desc);
                res.status(200).json(lecture);

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
 * Delete lecture method
 *
 */

exports.delete = function(req, res, next) {
    removeStructure(req, res, next);
};