var crypto = require('crypto'),
    randomToken = require('rand-token'),
    _ = require('lodash-node'),
    config = require('../../config/config');

/**
 * @param user
 *
 * @description
 * User model constructor function
 *
 */

function User(user) {

    this.token = randomToken.generate(16);
    this.login = user.login;
    this.password = User.encryptPassword(user.password);
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.last_visited = new Date();

};

/**
 * @param password
 *
 * @description
 * Static method that encrypt user password
 *
 */

User.encryptPassword = function(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * @param password
 * @param savedPassword
 *
 * @description
 * Static method that compare passwords
 *
 */

User.checkPassword = function(password, savedPassword) {
    return User.encryptPassword(password) === savedPassword;
};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Common static method to auth user
 *
 */

User.authUser = function(req, res, next) {

    var onlyWhiteList = config.get('onlyWhiteList');

    if (onlyWhiteList) {

        if (!_.isEmpty(req.body) && !_.isEmpty(req.body.login) && !_.isEmpty(req.body.password)) {

            var whiteList = config.get('whiteList');

            if (whiteList.indexOf(req.body.login) == -1) {
                var result = { status : 401, error : "Unauthorized: Your e-mail not in white list."};
                res.status(401).json(result);
            } else {
                User.authUser.byLogin(req, res, next);
            }

        }  else {
            return next(401);
        }
    } else {

        if (!_.isEmpty(req.body) && !_.isEmpty(req.body.login) && !_.isEmpty(req.body.password)) {
            User.authUser.byLogin(req, res, next);
        } else if ((!_.isEmpty(req.body) && !_.isEmpty(req.body.token)) || (!_.isEmpty(req.headers) && !_.isEmpty(req.headers.authorization))) {
            User.authUser.byToken(req, res, next);
        } else {
            return next(401);
        }
    }

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Auth user by token
 *
 */

User.authUser.byToken = function(req, res, next) {

    var reqToken = req.body.token || req.headers.authorization;

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var query = 'select u.user_id, u.token, u.login, u.first_name, u.last_name, u.last_visited' +
                    ' from users u where u.token = ?';

        connection.query(query, [reqToken], function (err, result) {

            if (err) {
                return next(err);
            }

            if(!_.size(result)) {
                result = { status : 401, error : "Unauthorized: Access is denied due to invalid credentials."};
                res.status(401).json(result);
            } else if(_.size(result)) {

                if(_.isEmpty(req.headers.isDevice)) {
                    req.session.user = { token : result[0].token, user_id : result[0].user_id };
                }

                res.status(200).json(result[0]);

            }

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Auth user by login
 *
 */

User.authUser.byLogin = function(req, res, next) {

    var login = req.body.login,
        password = req.body.password,
        _hashedPassword = User.encryptPassword(password);

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var query = 'select u.user_id, u.token, u.login, u.first_name, u.last_name, u.last_visited' +
                    ' from users u where u.login = ? and u.password = ?';

        connection.query(query, [login, _hashedPassword], function (err, results) {

            if (err) {
                return next(err);
            }


            if(!_.size(results)) {
                results = { status : 401, error : "Unauthorized: Access is denied due to invalid credentials."};
                res.status(401).json(results);
            } else if(_.size(results)) {

                if(_.isEmpty(req.headers.isDevice)) {
                    req.session.user = { token : results[0].token, user_id : results[0].user_id };
                } else {
                    results[0].expiration = config.get('deviceExpiration');
                }

                res.status(200).json(results[0]);

            }

        });

    });

};

/**
 * @param user
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Static method that check unique user and save
 *
 */

User.chekUniqAndSave = function(user, req, res, next) {

    req.getConnection(function(err, connection) {

        var query = "select login from users where login=?";
        connection.query(query, [req.body.login], function (err, results) {

            if (err) {
                return next(err);
            }

            if(!_.isEmpty(results)) {
                results = { status : 409, error : 'Login already exist.'};
                res.status(409).json(results);
            } else {
                User.save(connection, user, req, res, next);
            }

        });

    });

};

/**
 * @param connection
 * @param user
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Static method that save the user
 *
 */

User.save = function(connection, user, req, res, next) {

    var _user = new User(user);

    if(user.passwordRepeat && !User.checkPassword(user.passwordRepeat, _user.password)) {
        return res.status(409).json({ status : 409, error : "Password doesn't match."});
    }

    var query = "insert into users set ?";

    connection.query(query, _user, function (err, results) {

        if (err) {
            return next(err);
        }

        results = { status : 200, error : null, statusText : "OK" };
        res.status(200).json(results);

    });

};

exports.User = User;