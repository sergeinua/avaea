var removeStructure = require('../lib/lib').removeStructure,
    _               = require('lodash-node'),
    async           = require("async");


/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET courses method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        var _courses      = null,
            _tags         = null,
            _index        = null,
            _requestQuery = 'select * from courses where user_id = ? order by course_title;',
            _selectTags   = 'select t.tag_id, t.tag_name, ct.course_id from tags t join courses_tags ct on ' +
                            't.tag_id = ct.tag_id where ct.course_id in (select course_id from courses order by course_title);';

        if (err) {
            return next(err);
        }

        connection.query(_requestQuery + _selectTags, [req._user.user_id], function (err, results) {

            if (err) {
                return next(err);
            }
            _courses = results[0];
            _tags    = results[1];

            _.forEach(_tags, function(tag) {

                _index = _.findIndex(_courses, { course_id : tag.course_id });

                if(_index != -1) {

                    if(!_courses[_index].tags) {
                        _courses[_index].tags = [tag];
                    } else {
                        _courses[_index].tags.push(tag);
                    }

                }

            });

            res.status(200).json(_courses);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add courses method
 *
 */

exports.post = function(req, res, next) {

    if (_.isEmpty(req.body)) {
        return next(400);
    }

    var _params       = req.body,
        _requestQuery = 'insert into courses set ?; select * from tags;',
        _error        = {
            connection : {
                status : 503,
                err    : "Connection database error."
            },
            sql        : {
                status : 503,
                err    : "Transaction error."
            }
        };

    async.waterfall(
        [
            function(callback) {

                req.getConnection(function(err, connection) {

                    if (err) {
                        err = _.merge(_error.connection, err);
                        return callback(err);
                    }

                    callback(null, connection);

                });

            },
            function(connection, callback) {

                var _setParams = {
                    user_id       : req._user.user_id,
                    course_title  : _params.course_title,
                    course_desc   : _params.course_desc,
                    last_modified : new Date()
                };

                connection.query(_requestQuery, [_setParams], function (err, results) {

                    if (err) {
                        err = _.merge(_error.sql, err);
                        return callback(err);
                    }

                    callback(null, connection, results);

                });

            },
            function(connection, results, callback) {

                var _index = null,
                    _buffer = {
                        courseID     : results[0].insertId,
                        tagsToLink   : []
                    };

                if('tags' in _params && !_.isEmpty(_params.tags)) {

                    _requestQuery = '';

                    _.forEach(_params.tags, function(tag, ind) {

                        _index = _.findIndex(results[1], function(_tag) {
                            return _tag.tag_name.toLowerCase() == tag.tag_name.toLowerCase();
                        });

                        if(_index == -1) {
                            _requestQuery += 'insert into tags (tag_name) values(' + '"' + tag.tag_name + '"' + ');';
                        } else {
                            _buffer.tagsToLink.push({ insertId : results[1][_index].tag_id });
                        }

                    });

                    connection.beginTransaction(function(err) {

                        if (err) {
                            err = _.merge(_error.sql, err);
                            return callback(err);
                        }

                        if(!_requestQuery) {
                            return callback(null, connection, _buffer);
                        }

                        connection.query(_requestQuery, [], function (err, results) {

                            if (err) {
                                return connection.rollback(function() {
                                    err = _.merge(_error.sql, err);
                                    callback(err);
                                });
                            }

                            results.length && (_buffer.tagsToLink = _buffer.tagsToLink.concat(_.merge([], results)));
                            !results.length && _buffer.tagsToLink.push(_.merge({}, results));
                            callback(null, connection, _buffer);

                        });

                    });

                } else {
                    callback(null, connection, _buffer);
                }

            },
            function(connection, _buffer, callback) {

                _requestQuery = 'select * from courses where course_id = ?;';

                if(!_.isEmpty(_buffer.tagsToLink)) {
                    _.forEach(_buffer.tagsToLink, function(tag, ind) {
                        _requestQuery += 'insert into courses_tags (course_id, tag_id) ' +
                                         'values(' + _buffer.courseID + ', ' + tag.insertId + ');';
                    });
                }

                connection.query(_requestQuery, [_buffer.courseID], function (err, course) {

                    if (err) {
                        return connection.rollback(function() {
                            err = _.merge(_error.sql, err);
                            callback(err);
                        });
                    }

                    if(!_.isEmpty(_buffer.tagsToLink)) {

                        connection.commit(function(err) {

                            if (err) {
                                return connection.rollback(function() {
                                    err = _.merge(_error.sql, err);
                                    callback(err);
                                });
                            }

                            callback(null, course[0][0]);

                        });

                    } else {
                        callback(null, course[0]);
                    }

                });

            }
        ],
        function(err, results) {

            if(!err) {
                res.status(200).json(results);
            } else {
                return next(err);
            }

        }
    );

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Update course method
 *
 */

exports.put = function(req, res, next) {

    if (_.isEmpty(req.body) && !('course_id' in req.body)) {
        return next(400);
    }

    var _params       = req.body,
        _requestQuery = '',
        _error        = {
            connection : {
                status : 503,
                err    : "Connection database error."
            },
            sql        : {
                status : 503,
                err    : "Transaction error."
            }
        };

    async.waterfall(
        [
            function(callback) {

                req.getConnection(function(err, connection) {

                    if (err) {
                        err = _.merge(_error.connection, err);
                        return callback(err);
                    }

                    callback(null, connection);

                });

            },
            function(connection, callback) {

                var _courseSet = {}, _tags = null, _sqlParams = [];

                connection.beginTransaction(function(err) {

                    if (err) {
                        err = _.merge(_error.sql, err);
                        return callback(err);
                    }

                    _params.course_title && (_courseSet.course_title = _params.course_title);
                    _params.course_desc && (_courseSet.course_desc = _params.course_desc);
                    _requestQuery = 'select * from tags;';

                    if(!_.isEmpty(_courseSet)) {
                        _sqlParams = [_courseSet, _params.course_id];
                        _requestQuery += 'update courses set ? where course_id = ?;';
                    }

                    connection.query(_requestQuery, _sqlParams, function (err, results) {

                        if (err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        _tags = results[0];
                        callback(null, connection, _tags);

                    });

                });

            },
            function(connection, tags, callback) {

                var _index = null, _coursesTagsUp = [];

                if('tags' in _params && !_.isEmpty(_params.tags)) {

                    _requestQuery = '';

                    _.forEach(_params.tags, function(tag, ind) {

                        _index = _.findIndex(tags, function(_tag) {
                            return _tag.tag_name.toLowerCase() == tag.tag_name.toLowerCase();
                        });

                        if(_index == -1) {
                            _requestQuery += 'insert into tags (tag_name) ' +
                                             'values(' + '"' + tag.tag_name + '"' + ');';
                        } else {
                            _coursesTagsUp.push({ insertId : tags[_index].tag_id });
                        }

                    });

                    if(!_requestQuery) {
                        return callback(null, connection, _coursesTagsUp);
                    }

                    connection.query(_requestQuery, [], function (err, results) {

                        if (err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        results.length && (_coursesTagsUp = _coursesTagsUp.concat(_.merge([], results)));
                        !results.length && _coursesTagsUp.push(_.merge({}, results));
                        callback(null, connection, _coursesTagsUp);

                    });

                } else {
                    callback(null, connection, _coursesTagsUp);
                }

            },
            function(connection, tagsToUp, callback) {

                var _tempData = [];
                    _requestQuery = 'delete from courses_tags where course_id = ?;';

                if(!_.isEmpty(tagsToUp)) {
                    _.forEach(tagsToUp, function(tag, ind) {
                        _tempData.push(tag.insertId);
                        _requestQuery += 'insert into courses_tags (course_id, tag_id) ' +
                                         'values(' + _params.course_id + ', ' + tag.insertId + ');';
                    });
                }

                connection.query(_requestQuery, [_params.course_id], function (err, course) {

                    if (err) {
                        return connection.rollback(function() {
                            err = _.merge(_error.sql, err);
                            callback(err);
                        });
                    }

                    connection.commit(function(err) {

                        if (err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        callback(null, connection, _tempData);

                    });

                });

            },
            function(connection, tagIDs, callback) {

                var _response = null;
                    _requestQuery = 'select * from courses where course_id = ?;';
                    tagIDs.length && (_requestQuery += 'select * from tags where tag_id in (' + tagIDs.join(',') + ');');

                connection.query(_requestQuery, [_params.course_id], function (err, course) {

                    if (err) {
                        err = _.merge(_error.sql, err);
                        return callback(err);
                    }

                    _response = course[0][0] || course[0];
                    _response.tags = course[1] || [];
                    callback(null, _response);

                });

            }
        ],
        function(err, results) {

            if(!err) {
                res.status(200).json(results);
            } else {
                return next(err);
            }

        }
    );

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Delete course method
 *
 */

exports.delete = function(req, res, next) {
    removeStructure(req, res, next);
};