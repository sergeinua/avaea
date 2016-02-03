var fs    = require('fs-extra'),
    _     = require('lodash-node'),
    async = require('async'),
    _this = this;

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Remove structure functionality
 */

exports.removeStructure = function(req, res, next) {

    if(_.isEmpty(req.body)) {
        return next(400);
    }

    var _error = {
        connection : {
            status : 503,
            err    : "Connection database error."
        },
        badReq     : {
            status : 400,
            err    : "Bad request."
        },
        sql        : {
            status : 503,
            err    : "Transaction error."
        }
    },
    _typeRequest = { type : null },
    _queries = {
        course_id  : 'delete from courses where course_id = ?',
        lecture_id : 'delete from lectures where lecture_id = ?',
        chapter_id : 'delete from chapters where chapter_id = ?'
    },
    _favorites = {
        course_id  : 'delete from favorites where course_id = ?',
        lecture_id : 'delete from favorites where lecture_id = ?',
        chapter_id : 'delete from favorites where chapter_id = ?'
    };

    if('course_id' in req.body) {
        _typeRequest.type = 'course_id';
        _typeRequest.params = [req.body.course_id];
    } else if('lecture_id' in req.body) {
        _typeRequest.type = 'lecture_id';
        _typeRequest.params = [req.body.lecture_id];
    } else if('chapter_id' in req.body) {
        _typeRequest.type = 'chapter_id';
        _typeRequest.params = [req.body.chapter_id];
    } else {
        return next(400);
    }

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

                connection.beginTransaction(function(err) {

                    if(err) {
                        err = _.merge(_error.sql, err);
                        return callback(err);
                    }

                    connection.query(_favorites[_typeRequest.type], _typeRequest.params, function (err, deleted) {

                        if(err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        callback(null, connection);

                    });

                });

            },
            function(connection, callback) {

                connection.query(_queries[_typeRequest.type], _typeRequest.params, function (err, deleted) {

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

                        deleted = { error : null, deleted : true };
                        callback(null, deleted);

                    });

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
 * @param dir
 * @param callback
 * @param next
 *
 * @description
 * Remove file from file system
 */

exports.removeFile = function(dir, callback, next) {

    callback = callback || function() {};

    fs.remove(dir, function (err) {

        if (err) {

            if(next) {
                return next(err);
            }

            return callback(err);

        }

        if(next) {
            return next();
        }

        return callback(null);


    });

};

/**
 * @param dir
 * @param callback
 * @param next
 *
 * @description
 * Remove file from file system in case sql error
 */

exports.removeFileErr = function(dir, callback, next, error) {

    callback = callback || function() {};

    fs.remove(dir, function (err) {

        if (err) {

            if(next) {
                return next(_.merge(error, err));
            }

            return callback(_.merge(error, err));

        }

        if(next) {
            return next(error);
        }

        return callback(error);


    });

};

/**
 * @param body
 *
 * @description
 * body parser for user check rights that parses request body and finds in request
 * course_id or lecture_id or chapter_id
 * @return Object or null
 *
 */

exports.parseBody = function(body) {

    var _result    = null,
        _values    = {
            course_id  : {
                sql : 'select c.user_id, u.token from courses c, users u where u.user_id = c.user_id and course_id = ?',
                val : null
            },
            lecture_id : {
                sql : 'select c.user_id, u.token from courses c, users u where u.user_id = c.user_id and ' +
                      'course_id = (select course_id from lectures where lecture_id = ?)',
                val : null
            },
            chapter_id : {
                sql : 'select c.user_id, u.token from courses c, users u where u.user_id = c.user_id and course_id = ' +
                      '(select course_id from lectures where lecture_id = (select lecture_id from chapters where chapter_id = ?))',
                val : null
            }
        },
        _findValue = function(obj) {

            var _prop = null;

            function _iter(obj) {

                _.forEach(obj, function(val, key) {
                    if(_values[key]) {
                        return _prop = { type : key, value : val };
                    } else if(_.isPlainObject(val)) {
                        _iter(val);
                    }
                });

            };

            _iter(obj);
            return _prop;

        };

        if(_.isArray(body)) {
            _result = _findValue(body);
        } else if(_.isPlainObject(body)) {
            _result = _findValue(body);
        }

        if(_result) {
            _values[_result.type].val = _result.value;
            return _values[_result.type];
        }

    return null;

};