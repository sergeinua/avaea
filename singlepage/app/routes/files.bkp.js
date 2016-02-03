/*
 женя гомеляка

 ./public/media/1450704918732E5Pwjc0AU22QSxLV.mov
 ./public/media/1450704681103ArFySlt3FJ73TLaE.mp4

 avconv -y -i ./public/media/1450704918732E5Pwjc0AU22QSxLV.mov -acodec libmp3lame -ar 44100 -ac 1 -vcodec libx264 ./public/media/1450704918732E5Pwjc0AU22QSxLV.mov.mp4


 */
var path          = require('path'),
    randomToken   = require('rand-token'),
    _             = require('lodash-node'),
    multer        = require('multer'),
    fs            = require('fs-extra'),
    exec          = require('child_process').exec,
    config        = require('../../config/config'),
    storage       = multer.diskStorage({
        destination: config.get('mediaFolder'),
        filename: function (req, file, cb) {
            cb(null, +new Date() + "" + randomToken.generate(16) + '.' +
                file.originalname.split('.')[file.originalname.split('.').length - 1]
            );
        }
    }),
    upload        = multer({ storage : storage }).single('file'),
    async         = require('async'),
    removeFileErr = require('../lib/lib').removeFileErr;

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var query = 'select * from files where file_id = ?';

        connection.query(query, [req.params.file_id], function (err, results) {

            if (err) {
                return next(err);
            }

            res.status(200).json(results[0]);

        });

    });

};

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

    var screenSizes = {
        '16': {
            240: '426x240',
            480: '854x480'
        },
        '4': {
            240: '320x240',
            480: '640x480'
        }
    };

    var command = {
        aspect: 'mediainfo income |grep -i aspect',
        convertTo240: 'avconv -y -i income -codec:v h264 -codec:a copy -s screenSize output',
        convertTo480: 'avconv -y -i income -codec:v h264 -codec:a copy -s screenSize output',

        mediainfo: 'mediainfo income 2>&1 |grep -i format',
        convertToMp4: 'avconv -y -i income -codec:v h264 -codec:a copy output',

        fragmentation: './bentox86/bin/linux-x86/mp4fragment income output',
        convertToMpd: './bentox86/utils/mp4-dash.py -f income --output-dir=outputFolder',

        checkRotation: 'mediainfo income 2>&1 | grep -i rotation',
        thumbCreating: 'avconv -y -ss 00:00:01 -i income rotation -s 500x251 -vsync 1 -t 0.01 income.png',

        normalizeImage: 'exiftran -ai [income]'
    };

    function puts(error, stdout, stderr) {
        sys.puts(stdout);
    };

    var _workWithVideo = function(fileName, insertId, connection) {

        var pathToFile = config.get('mediaFolder') + req.file.filename,
            pathToMp4File = config.get('mediaFolder') + req.file.filename + '.mp4';

        exec(command.mediainfo.replace(/income/g, pathToFile), function(error, stdout, stderr) {

            console.log('mediainfo for ' + pathToFile + ': ' +  stdout.toLowerCase());

            if (
                !error &&
                (stdout.toLowerCase().indexOf('apple') != -1 || stdout.toLowerCase().indexOf('quicktime') != -1)
            ) {

                console.log('file needs to convert: ' + pathToFile);

                // invalid mp4, let's go to convert it to mp4
                exec(command.convertToMp4.replace(/income/g, pathToFile).replace(/output/g, pathToMp4File), function(error, stdout, stderr) {

                    if (!error) {

                        console.log('file converted: ' + pathToFile + ' -> ' + pathToMp4File);
                        _aspect(pathToMp4File, insertId, connection);

                    } else {
                        console.log('cannot convert: ' + pathToFile + ', error: ' + error + ', stderr: ' + stderr);
                    }

                })


            } else {
                // valid mp4, let's go to make mpeg-dash
                console.log('no needs to convert: ' + pathToFile);
                _aspect(pathToFile, insertId, connection);
            }
        });

    };

    var _aspect = function (incomingFile, insertId, connection) {

        var _command = command.aspect.replace(/income/g, incomingFile);
        exec(_command, function(error, stdout, stderr) {

            if (!error) {
                var aspect = stdout.split(':')[1].trim();

                console.log('video aspect: ' + aspect);
                _convertTo(240,incomingFile, aspect, insertId, connection);
                _convertTo(480,incomingFile, aspect, insertId, connection);
                _convertToDash(incomingFile, insertId, connection);
            }
        })

    };

    var _convertTo = function (size, incomingFile, aspect, insertId, connection) {

        var output = config.get('mediaFolder') + size + '-' + req.file.filename + '.mp4',
            outputFolder = config.get('mediaFolder') + size + '-' + req.file.filename + '.mpd',

            _command = command['convertTo' + size]
                .replace(/income/g, incomingFile)
                .replace(/output/g, output)
                .replace(/screenSize/g, screenSizes[aspect][size]);

        exec(_command, function(error, stdout, stderr) {

            if (!error) {
                console.log('converted to ' + size + ' :' + output);
                _convertToDash(output, insertId, connection, outputFolder, size);
            } else {
                console.log('error converting to ' + size + ': ' + error);
            }
        });

    };

    var _convertToDash = function (incomingFile, insertId, connection, outputFolder, size) {

        outputFolder = outputFolder || config.get('mediaFolder') + req.file.filename + '.mpd';

        var output = incomingFile + '.seg',
            fragmentation = command.fragmentation.replace(/income/g, incomingFile).replace(/output/g, output),
            convertToMpd = command.convertToMpd.replace(/income/g, output).replace(/outputFolder/g, outputFolder);

        exec(fragmentation, function(error, stdout, stderr) {

            if (!error) {

                console.log('file fragmented: ' + incomingFile + ' -> ' + output);

                exec(convertToMpd, function(error, stdout, stderr) {

                    if (!error) {
                        console.log('mpd done: ' + outputFolder);
                        exec('rm ' + output, function(error, stdout, stderr) {});

                        if (size) {
                            connection.query('update files set converted_' + size + ' = 1 where file_id=?', [insertId], function (err, results) {});
                        } else {
                            connection.query('update files set converted = 1 where file_id=?', [insertId], function (err, results) {});
                        }

                        if (!size) {
                            // make thumbnail
                            exec(command.checkRotation, function(error, stdout, stderr) {

                                var rotation = '';

                                if (!error && stdout.indexOf('Rotation') != -1) {
                                    if (stdout.indexOf('90') != -1) {
                                        rotation = '-vf transpose=1';
                                    } else if (stdout.indexOf('180') != -1) {
                                        rotation = '-vf transpose=1,transpose=1';
                                    } else if (stdout.indexOf('270') != -1) {
                                        rotation = '-vf transpose=1,transpose=1,transpose=1';
                                    }
                                }

                                exec(command.thumbCreating.replace(/income/g, incomingFile).replace(/rotation/g, rotation), function (error, stdout, stderr) {
                                    if (!error) {
                                        console.log("thumb was created: " + config.get('mediaFolder') + incomingFile + '.png');
                                    } else {
                                        console.log("error thumb creating: ");
                                        console.log(error);
                                    }
                                });

                            });
                        }

                    } else {
                        console.log('cannot make mpd: ' + output + ', error: ' + error + ', stderr: ' + stderr);
                    }

                })

            } else {
                exec('rm ' + output, function(error, stdout, stderr) {});
                console.log('connot fragment: ' + incomingFile + ', error: ' + error + ', stderr: ' + stderr);
            }

        })

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

                    var _query       = 'insert into files set ?',
                        _setParams   = {
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

                        // video resize and convert ro DASH
                        if (req.body.file_type_id == 1) {

                            _workWithVideo(req.file.filename, results.insertId, connection);
                        }
                        // normalize uploaded slide
                        else if (req.body.file_type_id == 3) {

                            exec(command.normalizeImage.replace(/income/g, config.get('mediaFolder') + req.file.filename), function(error, stdout, stderr) {
                                if (!error) {
                                    console.log("slide normalized: " + config.get('mediaFolder') + req.file.filename);
                                } else {
                                    console.log("slide normalizing error : " + error);
                                }
                            });

                        }

                        callback(null, connection);

                    });

                });

            },
            function(connection, callback) {

                if ('chapter_id' in req.body) {

                    var _setParams = [req.file.filename, req._user.user_id, req.body.chapter_id],
                        _query     = 'update chapters set file_id = (select file_id from files where file_name = ? and user_id = ?) ' +
                            'where chapter_id = ?';

                    connection.query(_query, _setParams, function (err, _results) {

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