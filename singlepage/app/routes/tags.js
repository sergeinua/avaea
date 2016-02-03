var _ = require('lodash-node');

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET tags method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        var _params       = req.params,
            _query        = '',
            _paramsArray  = [],
            _requestQuery = {
                all     : 'select * from tags order by tag_name',
                keyword : 'select * from tags where tag_name like ? order by tag_name'
            };

        if(!_.size(_params)) {
            _query = _requestQuery.all;
        } else {
            _query = _requestQuery.keyword;
            _paramsArray.push(_params.keyword + '%');
        }

        connection.query(_query, _paramsArray, function (err, tags) {

            if (err) {
                return next(err);
            }

            res.status(200).json(tags);

        });

    });

};

/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * Add tags method
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
            _requestQuery  = 'insert into tags set ?',
            _setParams     = { tag_name : _params.tag_name };

        connection.query(_requestQuery, _setParams, function (err, tag) {

            if (err) {
                return next(err);
            }

            _requestQuery = 'select * from tags where tag_id = ?';

            connection.query(_requestQuery, [tag.insertId], function (err, tags) {

                if (err) {
                    return next(err);
                }

                res.status(200).json(tags);

            });

        });

    });

};