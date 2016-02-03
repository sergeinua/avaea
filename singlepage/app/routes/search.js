var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Search functionality for courses and lectures and chapters
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        if(_.isEmpty(req.params) && _.isEmpty(req.params.query)) {
            return next(400);
        }

        var _response = { courses : null, lectures : null, chapters : null }, _q = req.params.query,
            _query =  {
                courses  : "select c.course_id, c.course_title, c.course_desc, " +
                           "(select fav_id from favorites where user_id = " + req._user.user_id + " and course_id=c.course_id) as fav_id from courses c where " +
                           "(c.course_title like '%" + _q + "%' or c.course_desc like '%" + _q + "%') order by c.course_title;",

                lectures : "select c.course_id, c.course_title, l.lecture_id, l.lecture_title, l.lecture_desc, " +
                           "(select fav_id from favorites where user_id = " + req._user.user_id + " and lecture_id=l.lecture_id) as fav_id " +
                           "from lectures l join courses c on l.course_id = c.course_id where " +
                           "(l.lecture_title like '%" + _q + "%' or l.lecture_desc like '%" + _q + "%') order by l.lecture_title;",

                chapters : "select ch.chapter_id, ch.chapter_title, ch.chapter_desc, l.lecture_id, l.lecture_title, c.course_id, c.course_title, " +
                           "(select fav_id from favorites where user_id = " + req._user.user_id + " and chapter_id=ch.chapter_id) as fav_id " +
                           "from chapters ch join lectures l on ch.lecture_id = l.lecture_id join courses c on c.course_id = l.course_id where " +
                           "(ch.chapter_title like '%" + _q + "%' or ch.chapter_desc like '%" + _q + "%') order by ch.chapter_order;"
            };

        _query = _query.courses + _query.lectures + _query.chapters;

        connection.query(_query, [], function (err, results) {

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
 * Get all method for search
 *
 */

exports.getAll = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _query =  "select c.course_id, c.course_title, c.course_desc, " +
                      "(select fav_id from favorites where user_id = " + req._user.user_id + " and course_id = c.course_id) " +
                      "as fav_id from courses c order by c.course_title;";

        connection.query(_query, [], function (err, results) {

            if (err) {
                return next(err);
            }

            res.status(200).json(results);

        });

    });

};