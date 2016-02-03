var removeStructure = require('../lib/lib').removeStructure,
    _               = require('lodash-node'),
    async           = require("async");

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET chapters method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        var _query = 'select c.*, cs.*, l.*, f.file_name, ft.file_type_name, f.converted, '  +
                     '(select count(*) from slides where chapter_id=c.chapter_id) as slides ' +
                     'from chapters c left join files f on c.file_id = f.file_id ' +
                     'left join file_types ft on f.file_type_id = ft.file_type_id ' +
                     'left join lectures l on c.lecture_id = l.lecture_id ' +
                     'left join courses cs on l.course_id = cs.course_id ' +
                     'where c.lecture_id=? order by chapter_order asc';

        if (err) {
            return next(err);
        }

        connection.query(_query, [req.params.lecture_id], function (err, chapters) {

            if (err) {
                return next(err);
            }

            res.status(200).json(chapters);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add chapter method
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

        var params        = req.body,
            requestQuery  = 'insert into chapters (lecture_id, chapter_order, chapter_title, chapter_desc) select ?, ' +
                            '(count(*) + 1), ?, ? from chapters where lecture_id = ?',
            selectQueries = 'select * from chapters where chapter_id = ? order by chapter_order desc limit 1';

        connection.query(requestQuery, [params.lecture_id, params.chapter_title, params.chapter_desc, params.lecture_id], function (err, chapter) {

            if (err) {
                return next(err);
            }

            connection.query(selectQueries, [chapter.insertId], function (err, _chapter) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(_chapter[0]);

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
 * Update chapter method
 *
 */

exports.put = function(req, res, next) {

    if ( _.isEmpty(req.body) || !('chapter_id' in req.body) ) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params      = req.body,
            _chapterSet  = {},
            _updateQuery = 'update chapters set ? where chapter_id = ?',
            _selectQuery = 'select c.*, f.file_name, ft.file_type_name, f.converted, ' +
                           '(select count(*) from slides where chapter_id = c.chapter_id) as slides ' +
                           'from chapters c left join files f on c.file_id = f.file_id ' +
                           'left join file_types ft on f.file_type_id = ft.file_type_id ' +
                           'where c.chapter_id = ?';

            if(_params.chapter_title || _params.chapter_desc) {
                _params.chapter_title && (_chapterSet.chapter_title = _params.chapter_title);
                _params.chapter_desc && (_chapterSet.chapter_desc = _params.chapter_desc);
            }

            connection.query(_selectQuery, [_params.chapter_id], function (err, chapter) {

                if (err) {
                    return next(err);
                }

                connection.query(_updateQuery, [_chapterSet, _params.chapter_id], function (err, _results) {

                    if (err) {
                        return next(err);
                    }

                    chapter = chapter[0];
                    _params.chapter_title && (chapter.chapter_title = _params.chapter_title);
                    _params.chapter_desc && (chapter.chapter_desc = _params.chapter_desc);
                    res.status(200).json(chapter);

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
 * Reorder chapter method
 *
 */

exports.reorder = function(req, res, next) {

    if (_.isEmpty(req.body) && !('order' in req.body && 'lecture_id' in req.body)) {
        return next(400);
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _chapters     = req.body.order,
            _requestQuery = '',
            _selectQuery  = 'select c.*, cs.*, l.*, f.file_name, ft.file_type_name, f.converted, (select count(*) from slides where chapter_id=c.chapter_id) as slides ' +
                            'from chapters c left join files f on c.file_id = f.file_id ' +
                            'left join file_types ft on f.file_type_id = ft.file_type_id ' +
                            'left join lectures l on c.lecture_id = l.lecture_id ' +
                            'left join courses cs on l.course_id = cs.course_id ' +
                            'where c.lecture_id=? order by chapter_order asc';

        _.forEach(_chapters, function(elem) {

            _requestQuery += 'update chapters set chapter_order = ' + elem.chapter_order + ' where chapter_id = ' + elem.chapter_id + ';';

            if(elem.chapter_id == _chapters[_chapters.length - 1].chapter_id) {
                _requestQuery += _selectQuery;
            }

        });

        connection.query(_requestQuery, [req.body.lecture_id], function (err, chapters) {

            if (err) {
                return next(err);
            }

            res.status(200).json(chapters[chapters.length - 1]);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Delete chapter method
 *
 */

exports.delete = function(req, res, next) {
    removeStructure(req, res, next);
};