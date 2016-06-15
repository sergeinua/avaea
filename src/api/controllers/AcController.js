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

    Airports.query('SELECT name, city, country, iata_3code, state, state_short, neighbors FROM '+Airports.tableName +
      " WHERE (name ~* $1) OR (city ~* $1) OR (iata_3code ~* $1) OR (state ~* $1) " +
      " ORDER BY (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, pax DESC, levenshtein($3, city) ASC LIMIT " + (_limit ? _limit : 8),

      ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], // query params

      function (err, found) {
        if (!err && found.rows.length) {
          var uniqCityCountry = {};
          var result = [];
          for (var i = 0; i < found.rows.length; i++) {
            if (!uniqCityCountry[found.rows[i].city + found.rows[i].state_short + found.rows[i].country]) {
              uniqCityCountry[found.rows[i].city + found.rows[i].state_short + found.rows[i].country] = 1;
            } else {
              uniqCityCountry[found.rows[i].city + found.rows[i].state_short + found.rows[i].country]++;
            }
            if (!uniqCityCountry[found.rows[i].city]) {
              uniqCityCountry[found.rows[i].city] = 1;
            } else {
              uniqCityCountry[found.rows[i].city]++;
            }
            //found.rows[i] = found.rows[i].city + ', ' + found.rows[i].name + ' (' + found.rows[i].iata_3code + ')';
            found.rows[i].city_full = found.rows[i].city + (found.rows[i].state?', ' + found.rows[i].state:', ' + found.rows[i].country);
            result[i] = {
              city: found.rows[i].city,
              name: found.rows[i].name,
              value: found.rows[i].iata_3code,
              neighbors: found.rows[i].neighbors ? JSON.parse(found.rows[i].neighbors).slice(0,2) : [{"iata_3code": "", "distance": 0},{"iata_3code": "", "distance": 0}],
              tokens: found.rows[i].city.toLowerCase().split(/\s+/).concat(found.rows[i].name.toLowerCase().split(/\s+/).concat([found.rows[i].iata_3code.toLowerCase()]))
            };
          }

          for (var i = 0; i < found.rows.length; i++) {
            if (parseInt(uniqCityCountry[found.rows[i].city + found.rows[i].state_short + found.rows[i].country]) != parseInt(uniqCityCountry[found.rows[i].city])) {
              result[i].city = found.rows[i].city_full;
            }
          }
          return res.json(result);
        }
        else {
          sails.log.error(err);
          return res.json([]);
        }
      });
  }
};
