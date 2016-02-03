var path          = require('path'),
    randomToken   = require('rand-token'),
    _             = require('lodash-node'),
    multer        = require('multer'),
    fs            = require('fs-extra'),
    exec          = require('child_process').exec,
    config        = require('../../config/config'),
    storage       = multer.diskStorage(
                            {
                                destination: config.get('mediaFolder'),
                                filename: function (req, file, cb) {
                                    cb(null, +new Date() + "" + randomToken.generate(16) + '.' +
                                       file.originalname.split('.')[file.originalname.split('.').length - 1]
                                    );
                                }
                            }
                    ),
    upload        = multer({ storage : storage }).single('file'),
    async         = require('async'),
    removeFileErr = require('../lib/lib').removeFileErr,
    log           = require('../lib/log')(module);

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET files method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _query = 'select * from files where file_id = ?';

        connection.query(_query, [req.params.file_id], function (err, file) {

            if (err) {
                return next(err);
            }

            res.status(200).json(file[0]);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add/upload file(s) to chapter files method
 *
 */

exports.post = function(req, res, next) {

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
        },
        upload     : {
            status : 503,
            err    : "Uploading error."
        }
    };

    async.waterfall(
        [
            function(callback) {

                upload(req, res, function (err) {

                    if (err) {
                        err = _.merge(_error.upload, err);
                        return callback(err);
                    }

                    if(_.isEmpty(req.body) || _.isEmpty(req.body.file_type_id)) {
                        return callback(_error.badReq);
                    }

                    callback(null);

                });

            },
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

                    var _query          = 'insert into files set ?',
                        _update         = 'update files set converted = 1 where file_id = ?',
                        _setParams      = {
                            file_type_id : req.body.file_type_id,
                            file_name    : req.file.filename,
                            user_id      : req._user.user_id
                        };

                    connection.query(_query, _setParams, function (err, results) {

                        if (err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        var _rotation            = '',
                            _pathToFile          = config.get('mediaFolder') + req.file.filename,
                            _pathTo480File       = config.get('mediaFolder') + '480-' + req.file.filename,
                            _pathToMp4File       = config.get('mediaFolder') + 'mp4_' +req.file.filename,
                            _pathToSegmentedFile = config.get('mediaFolder') + 'mp4_seg_' +req.file.filename,
                            _pathToMpdFolder     = config.get('mediaFolder') + req.file.filename + '.mpd',
                            _pathToThumbnail     = _pathToFile + '.png',
                            _pathToFileMp3       = config.get('mediaFolder') + req.file.filename + '.mp3',
                            _command             = {

                                /**
                                 * for future
                                 */

                                aspect                 : 'mediainfo ' + _pathToFile + ' |grep -i aspect',
                                convertTo480           : 'avconv -i ' + _pathToFile + ' -codec:v h264 -codec:a copy -s 640x480 ' + _pathTo480File,

                                /**
                                 * currently used
                                 */

                                mediainfo              : 'mediainfo ' + _pathToFile + ' 2>&1 |grep -i "format profile"',
                                convertToMp4           : 'avconv -i ' + _pathToFile + ' -codec:v h264 -codec:a copy ' + _pathToMp4File,

                                fragmentationConverted : './bentox86/bin/linux-x86/mp4fragment ' + _pathToMp4File + ' ' + _pathToSegmentedFile,
                                fragmentation          : './bentox86/bin/linux-x86/mp4fragment --fragment-duration 1000 ' + _pathToFile + ' ' + _pathToSegmentedFile,

                                convertToMpd           : './bentox86/utils/mp4-dash.py --use-segment-timeline -f ' + _pathToSegmentedFile + ' --output-dir=' + _pathToMpdFolder,

                                checkRotation          : 'mediainfo ' + _pathToFile + ' 2>&1 | grep -i rotation',
                                thumbCreating          : 'avconv -ss 00:00:01 -i ' + _pathToFile + ' ' + _rotation + ' -s 500x251 -vsync 1 -t 0.01 ' + _pathToThumbnail,

                                normalizeImage         : 'exiftran -ai ' + _pathToFile,

                                convertToMp3           : 'avconv -i ' + _pathToFile + ' -c:a libmp3lame ' + _pathToFileMp3

                        };

                        /**
                        * make thumbnail for uploaded video
                        */

                        // TODO rewrite to async code using promises or async js

                        if (req.body.file_type_id == 1) {

                            exec(_command.mediainfo, function(error, stdout, stderr) {

                                if (!error && stdout.toLowerCase().indexOf('base media') == -1) {

                                    log.info('file needs to convert: ' + _pathToFile + ', user_id : ' + req._user.user_id);

                                    /**
                                     * invalid mp4, let's go to convert it to mp4
                                     */

                                    exec(_command.convertToMp4, function(error, stdout, stderr) {

                                        if (!error) {

                                            log.info('file converted: ' + _pathToFile + ' -> ' + _pathToMp4File + ', user_id : ' + req._user.user_id);

                                            exec(_command.fragmentationConverted, function(error, stdout, stderr) {

                                                if (!error) {

                                                    log.info('file fragmented: ' + _pathToMp4File + ' -> ' + _pathToSegmentedFile + ', user_id : ' + req._user.user_id);
                                                    exec('rm ' + _pathToMp4File, function(error, stdout, stderr) {});

                                                    exec(_command.convertToMpd, function(error, stdout, stderr) {

                                                        if (!error) {

                                                            log.info('mpd done: ' + _pathToSegmentedFile + ', user_id : ' + req._user.user_id);
                                                            exec('rm ' + _pathToSegmentedFile, function(error, stdout, stderr) {});
                                                            connection.query(_update, [results.insertId], function (err, results) {});

                                                        } else {
                                                            log.info('cannot make mpd: ' + _pathToSegmentedFile + ', error: ' + error + ', stderr: ' + stderr + ', user_id : ' + req._user.user_id);
                                                        }

                                                    });

                                                } else {
                                                    log.info('connot fragment: ' + _pathToMp4File + ', error: ' + error + ', stderr: ' + stderr + ', user_id : ' + req._user.user_id);
                                                }

                                            });

                                        } else {
                                            log.info('cannot convert: ' + _pathToFile + ', error: ' + error + ', stderr: ' + stderr + ', user_id : ' + req._user.user_id);
                                        }

                                    })


                                } else {

                                    /**
                                    * valid mp4, let's go to make mpeg-dash
                                    */

                                    _pathToMp4File = _pathToFile;
                                    log.info('no needs to convert: ' + _pathToMp4File + ', user_id : ' + req._user.user_id);

                                    exec(_command.fragmentation, function(error, stdout, stderr) {

                                        if (!error) {

                                            log.info('file fragmented: ' + _pathToMp4File + ' -> ' + _pathToSegmentedFile + ', user_id : ' + req._user.user_id);

                                            exec(_command.convertToMpd, function(error, stdout, stderr) {

                                                if (!error) {
                                                    log.info('mpd done: ' + _pathToSegmentedFile + ', user_id : ' + req._user.user_id);
                                                    exec('rm ' + _pathToSegmentedFile, function(error, stdout, stderr) {});
                                                    connection.query(_update, [results.insertId], function (err, results) {});
                                                } else {
                                                    log.info('cannot make mpd: ' + _pathToSegmentedFile + ', user_id : ' + req._user.user_id);
                                                }

                                            });

                                        } else {
                                            log.info('connot fragment: ' + _pathToMp4File + ', error: ' + error + ', stderr: ' + stderr + ', user_id : ' + req._user.user_id);
                                        }

                                    });

                                }
                            });

                            /**
                             * make thumbnail
                             */

                            exec(_command.checkRotation, function(error, stdout, stderr) {

                                if (!error && stdout.indexOf('Rotation') != -1) {

                                    if (stdout.indexOf('90') != -1) {
                                        _rotation = '-vf transpose=1';
                                    } else if (stdout.indexOf('180') != -1) {
                                        _rotation = '-vf transpose=1,transpose=1';
                                    } else if (stdout.indexOf('270') != -1) {
                                        _rotation = '-vf transpose=1,transpose=1,transpose=1';
                                    }

                                }

                                exec(_command.thumbCreating, function (error, stdout, stderr) {
                                    if (!error) {
                                        log.info("thumb was created: " + config.get('mediaFolder') + req.file.filename + '.png' + ', user_id : ' + req._user.user_id);
                                    } else {
                                        log.info('user_id : ' + req._user.user_id + " error thumb creating: " );
                                        log.info(error);
                                    }
                                });

                            });

                        } else

                        /**
                         * convert voice to mp3
                         */

                        if (req.body.file_type_id == 2) {

                            exec(_command.convertToMp3, function(error, stdout, stderr) {

                                if (!error) {
                                    log.info('mp3 done: ' + _pathToFile + ' -> ' + _pathToFileMp3 + ', user_id : ' + req._user.user_id);
                                    connection.query(_update, [results.insertId], function (err, results) {});
                                } else {
                                    log.info('cannot convert to mp3: ' + _pathToFile+ ', error: ' + error + ', stderr: ' + stderr + ', user_id : ' + req._user.user_id);
                                }

                            });

                        }

                        /**
                         * normalize uploaded slide
                         */

                        else if (req.body.file_type_id == 3) {

                            exec(_command.normalizeImage, function(error, stdout, stderr) {
                                if (!error) {
                                    log.info("slide normalized: " + config.get('mediaFolder') + req.file.filename + ', user_id : ' + req._user.user_id);
                                } else {
                                    log.info("slide normalizing error : " + error + ', user_id : ' + req._user.user_id);
                                }
                            });

                        }

                        callback(null, connection);

                    });

                });

            },
            function(connection, callback) {

                if('chapter_id' in req.body) {

                    var _setParams = [req.file.filename, req._user.user_id, req.body.chapter_id],
                        _query     = 'update chapters set file_id = (select file_id from files where file_name = ? and user_id = ?) ' +
                                     'where chapter_id = ?';

                    connection.query(_query, _setParams, function (err, updated) {

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

                            callback(null, connection);

                        });

                    });

                } else {

                    connection.commit(function(err) {

                        if (err) {
                            return connection.rollback(function() {
                                err = _.merge(_error.sql, err);
                                callback(err);
                            });
                        }

                        callback(null, connection);

                    });

                }

            },
            function(connection, callback) {

                var _selectQuery = 'select f.file_id, f.file_type_id, f.file_name, f.user_id, ft.file_type_name from files f ' +
                                   'left join file_types ft on f.file_type_id = ft.file_type_id ' +
                                   'where f.file_name = ? and f.user_id = ?';

                connection.query(_selectQuery, [req.file.filename, req._user.user_id], function (err, file) {

                    if (err) {
                        err = _.merge(_error.sql, err);
                        return callback(err);
                    }

                    file = file[0];
                    callback(null, file);

                });

            }
        ],
        function(err, results) {

            if(!err) {
                res.status(200).json(results);
            } else {

                if(err.upload) {
                    return next(err);
                }

                removeFileErr(req.file.path, null, next, err);

            }

        }
    );

};