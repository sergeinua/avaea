var checkRights     = require('../lib/lib').checkRights,
    removeStructure = require('../lib/lib').removeStructure,
    _               = require('lodash-node'),
    async           = require("async");

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        var query =  'select c.*, cs.*, l.*, f.file_name, ft.file_type_name, f.converted, f.converted_240, f.converted_480, (select count(*) from slides where chapter_id=c.chapter_id) as slides ';
        query += 'from chapters c left join files f on c.file_id = f.file_id ';
        query += 'left join file_types ft on f.file_type_id = ft.file_type_id ';
        query += 'left join lectures l on c.lecture_id = l.lecture_id ';
        query += 'left join courses cs on l.course_id = cs.course_id ';
        query += 'where c.lecture_id=? order by chapter_order asc';

        if (err) {
            return next(err);
        }

        connection.query(query, [req.params.lecture_id], function (err, results) {

            if (err) {
                return next(err);
            }

            res.status(200).json(results);
        });

    });

};

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
            selectQueries = 'select * from chapters where lecture_id=? order by chapter_order desc limit 1';

        connection.query(requestQuery, [params.lecture_id, params.chapter_title, params.chapter_desc, params.lecture_id], function (err, results) {

            if (err) {
                return next(err);
            }

            connection.query(selectQueries, [params.lecture_id], function (err, _results) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(_results[0]);

            });

        });

    });

};

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
            _error       = {},
            _updateQuery = 'update chapters set ? where chapter_id = ?',
            _selectQuery = 'select c.*, f.file_name, ft.file_type_name, f.converted, f.converted_240, f.converted_480, cou.user_id, u.token, ' +
                '(select count(*) from slides where chapter_id=c.chapter_id) as slides ' +
                'from chapters c left join files f on c.file_id = f.file_id ' +
                'left join file_types ft on f.file_type_id = ft.file_type_id ' +
                'left join courses cou on course_id = ' +
                '(select course_id from lectures where lecture_id = (select lecture_id from chapters where chapter_id = ?)) ' +
                'left join users u on u.user_id = cou.user_id where c.chapter_id=?';

        if(_params.chapter_title || _params.chapter_desc) {
            _params.chapter_title && (_chapterSet.chapter_title = _params.chapter_title);
            _params.chapter_desc && (_chapterSet.chapter_desc = _params.chapter_desc);
        }

        connection.query(_selectQuery, [_params.chapter_id, _params.chapter_id], function (err, chapter) {

            if (err) {
                return next(err);
            }

            _error = checkRights(req, res, chapter);

            if(_error.error && _error.status) {
                return next(_error);
            }

            connection.query(_updateQuery, [_chapterSet, _params.chapter_id], function (err, _results) {

                if (err) {
                    return next(err);
                }

                chapter = chapter[0];
                delete chapter.user_id;
                delete chapter.token;
                _params.chapter_title && (chapter.chapter_title = _params.chapter_title);
                _params.chapter_desc && (chapter.chapter_desc = _params.chapter_desc);
                res.status(200).json(chapter);

            });

        });

    });

};

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
            _selectQuery  = 'select c.*, cs.*, l.*, f.file_name, ft.file_type_name, f.converted, f.converted_240, f.converted_480, (select count(*) from slides where chapter_id=c.chapter_id) as slides ' +
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

exports.delete = function(req, res, next) {
    removeStructure(req, res, next);
};