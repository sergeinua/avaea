var _   = require('lodash-node'),
    log = require('../lib/log')(module);

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Get slides method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        var _selectQuery = 'select s.slide_id, f.file_id, f.file_name, s.offset, s.duration, s.over_video, ft.file_type_name ' +
                           'from slides s, files f, file_types ft where s.file_id = f.file_id and f.file_type_id = ft.file_type_id ' +
                           'and chapter_id = ? order by offset';

        if (err) {
            return next(err);
        }

        connection.query(_selectQuery, [req.params.chapter_id], function (err, slides) {

            if (err) {
                return next(err);
            }

            res.status(200).json(slides);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add slides method
 *
 */

exports.post = function(req, res, next) {

    if ( _.isEmpty(req.body) && _.isEmpty(req.body.files) && !('chapter_id' in req.body) ) {
        return next({ status : 400, error : 'No one files in set' });
    }

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params       = req.body,
            _requestQuery = '',
            _selectQuery  = 'select s.slide_id, f.file_id, f.file_name, s.offset, s.duration, s.over_video, ft.file_type_name ' +
                            'from slides s, files f, file_types ft where s.file_id = f.file_id and f.file_type_id = ft.file_type_id ' +
                            'and s.chapter_id = ? order by offset';

        _.forEach(_params.files, function(file, key) {

            if (file.file_id) {
                _requestQuery += 'insert into slides (chapter_id, file_id, offset) ' +
                                 'values(' + _params.chapter_id + ', ' + file.file_id + ', ' + 0 + ');';
            } else {
                log.info({ error : 'No file_id in the ' + i + '\'th file item' });
            }

        });

        _requestQuery += _selectQuery;

        connection.query(_requestQuery, [_params.chapter_id], function (err, slides) {

            if (err) {
                return next(err);
            }

            res.status(200).json(slides[slides.length - 1]);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Update slides method
 *
 */

exports.put = function(req, res, next) {

    if (_.isEmpty(req.body) && !('chapter_id' in req.body) && !('slide_id' in req.body)) {
        return next({ status : 400, error : 'Invalid data set for the slide' });
    }

    req.getConnection(function (err, connection) {

        if (err) {
            return next(err);
        }

        var _selectQuery  = null,
            _requestQuery = 'update slides set ',
            _params       = req.body,
            _setParams    = [_params.chapter_id, _params.slide_id],
            _timeParams   = [];

        _requestQuery += 'offset = ?,';
        _timeParams.push(_params.offset);

        if (_params.duration) {
            _requestQuery += 'duration = ?,';
            _timeParams.push(_params.duration);
        }

        _requestQuery += 'over_video = ?';
        _timeParams.push(_params.over_video);
        _setParams = _timeParams.concat(_setParams);
        _requestQuery += ' where chapter_id = ? and slide_id = ?';

        connection.query(_requestQuery, _setParams, function (err, updated) {

            if (err) {
                return next(err);
            }

            _selectQuery = 'select s.slide_id, f.file_id, f.file_name, s.offset, s.duration, s.over_video, ft.file_type_name ' +
                           'from slides s, files f, file_types ft where s.file_id = f.file_id and f.file_type_id = ft.file_type_id ' +
                           'and s.chapter_id = ? order by offset';

            connection.query(_selectQuery, [_params.chapter_id], function (err, slides) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(slides);

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
 * Delete slides method
 *
 */

exports.delete = function(req, res, next) {

    if ( _.isEmpty(req.body) && !('chapter_id' in req.body) && !('slide_id' in req.body) ) {
        return next({ status: 400, error : 'Invalid data set for the slide' });
    }

    req.getConnection(function (err, connection) {

        if (err) {
            return next(err);
        }

        var _params = req.body,
            _query  = 'delete from slides where chapter_id = ? and slide_id = ?;' +
                      'select s.slide_id, f.file_id, f.file_name, s.offset, s.duration, s.over_video, ft.file_type_name ' +
                      'from slides s, files f, file_types ft where s.file_id = f.file_id and f.file_type_id = ft.file_type_id ' +
                      'and s.chapter_id = ? order by offset;';

        connection.query(_query, [_params.chapter_id, _params.slide_id, _params.chapter_id], function (err, slides) {

            if (err) {
                return next(err);
            }

            res.status(200).json(slides[slides.length - 1]);

        });

    })
};