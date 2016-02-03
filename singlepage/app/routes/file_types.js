/**
 * @param req
 * @param res
 * @param next
 *
 * @description
 * GET file types method
 *
 */

exports.get = function(req, res, next) {

    req.getConnection(function(err, connection) {

        if (err) {
            return next(err);
        }

        connection.query('select * from file_types', [], function (err, file_types) {

            if (err) {
                return next(err);
            }

            res.status(200).json(file_types);

        });

    });

};
