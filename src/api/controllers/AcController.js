/**
 * AcController
 *
 * @description :: Server-side logic for managing autocompleting
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  airports: function (req, res) {

    // For dev debug
    //res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    //res.header('Expires', '-1');
    //res.header('Pragma', 'no-cache');

    // Trim left whitespaces
    var _query = req.param('q').replace(/^\s*/,"");
    var _limit = parseInt(req.param('l'));

    Airports.query('SELECT name, city, iata_3code, neighbors FROM '+Airports.tableName +
      " WHERE (name ~* $1) OR (city ~* $1) OR (iata_3code ~* $1)" +
      " ORDER BY (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, pax DESC, levenshtein($3, city) ASC LIMIT " + (_limit ? _limit : 8),

      ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], // query params

      function (err, found) {
        if (!err && found.rows.length) {
          for (var i = 0; i < found.rows.length; i++) {
            //found.rows[i] = found.rows[i].city + ', ' + found.rows[i].name + ' (' + found.rows[i].iata_3code + ')';
            found.rows[i] = {
              city: found.rows[i].city,
              name: found.rows[i].name,
              value: found.rows[i].iata_3code,
              neighbors: found.rows[i].neighbors ? JSON.parse(found.rows[i].neighbors).slice(0,2) : [{"iata_3code": "", "distance": 0},{"iata_3code": "", "distance": 0}],
              tokens: found.rows[i].city.toLowerCase().split(/\s+/).concat(found.rows[i].name.toLowerCase().split(/\s+/).concat([found.rows[i].iata_3code.toLowerCase()]))
            }

          }
          return res.json(found.rows);
        }
        else {
          sails.log.error(err);
          return res.json([]);
        }
      });
  }
};
