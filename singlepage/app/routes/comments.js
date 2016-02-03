var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET comments method
 *
 */

exports.get = function(req, res, next) {

    if(!('chapter_id') in req.params) {
        return next({ error : 'chapter_id is empty', status : 400 });
    }

    req.getConnection(function(err, connection) {

        var _query = 'select * from comments where chapter_id = ? order by last_modified desc';

        if (err) {
            return next(err);
        }

        connection.query(_query, [req.params.chapter_id], function (err, comments) {

            if (err) {
                return next(err);
            }

            res.status(200).json(comments);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add comment method
 *
 */

exports.post = function(req, res, next) {

    if(_.isEmpty(req.body) && !('chapter_id' in req.body) && !('comment_text' in req.body)) {
        return next({ error : 'chapter_id or/and comment_text is/are empty', status : 400 });
    }

    req.getConnection(function(err, connection) {

        var _query     = 'insert into comments set ?;' +
                         'select * from comments where chapter_id = ? order by last_modified desc;',
            _insertSet = {
                user_id       : req._user.user_id,
                chapter_id    : req.body.chapter_id,
                offset        : req.body.offset || null,
                comment_text  : req.body.comment_text,
                last_modified : new Date()


            };

        if (err) {
            return next(err);
        }

        connection.query(_query, [_insertSet, req.body.chapter_id], function (err, comments) {

            if (err) {
                return next(err);
            }

            res.status(200).json(comments[comments.length - 1]);

        });

    });

};