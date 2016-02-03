var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET categories method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        connection.query('select * from categories', [], function (err, results) {

            if (err) {
                return next(err);
            }

            res.status(200).json(results);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add category method
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

        var _params        = req.body,
            _requestQuery  = 'insert into categories set ?',
            _selectQueries = 'select * from categories where category_name=?',
            _setParams     = { category_name : _params.category_name };

        connection.query(_requestQuery, _setParams, function (err, insert) {

            if (err) {
                return next(err);
            }

            connection.query(_selectQueries, [_params.category_name], function (err, category) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(category[0]);

            });

        });

    });

};