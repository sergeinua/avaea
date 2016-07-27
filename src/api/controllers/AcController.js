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
    var _query = req.param('q', '').replace(/^\s*/,"").replace(/(\W)/g,"$1?");
    var _limit = parseInt(req.param('l'));
    var result = [];

    var mainSelect = "SELECT "+
      "   name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
      "FROM "+
      Airports.tableName+" "+
      "WHERE "+
      "   (name ~* $1) OR "+
      "   (city ~* $1) OR "+
      "   (iata_3code ~* $1) OR "+
      "   (state ~* $1) OR "+
      "   (concat(city,',',state) ~* $1) OR "+
      "   (concat(city,',',state_short) ~* $1) OR "+
      "   (concat(city,',',country) ~* $1) OR "+
      "   (concat(city,' ',state) ~* $1) OR "+
      "   (concat(city,' ',state_short) ~* $1) OR "+
      "   (concat(city,' ',country) ~* $1) OR" +
      "   (country ~* $1) " +
      "ORDER BY "+
      "   (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, "+
      "   pax DESC, "+
      "   levenshtein($3, city) ASC "+
      "LIMIT " + (_limit ? _limit : 8),

      selectNeighbors = "SELECT "+
        "   name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
        "FROM "+
        Airports.tableName+" "+
        "WHERE "+
        "   {where} "+
        "ORDER BY "+
        "   (CASE WHEN name=$1 THEN 0 ELSE 1 END) ASC, "+
        "   pax DESC, "+
        "   levenshtein($2, city) ASC "+
        "LIMIT " + (_limit ? _limit : 8);


    async.waterfall ([

      function(callback) {
        makeQuery(mainSelect, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows) {
          callback(null, rows);
        })
      },

      function(mainRows, callback) {
        var cleanedList =  [], whereCode = "(iata_3code = '{code}')", whereResult = [];

        if (mainRows.length) {
          mainRows.forEach (function (item) {
            if (!item.pax) {
              item.neighbors.forEach (function (itemN) {
                if (itemN.iata_3code) {
                  whereResult.push (whereCode.replace ('{code}', itemN.iata_3code))
                }
              })
            } else {
              cleanedList.push (item);
            }
          });

          if (whereResult.length) {
            selectNeighbors = selectNeighbors.replace ('{where}', whereResult.join (' OR '));
            makeQuery (selectNeighbors, [Airports.ALL_AIRPORTS_NAME, _query], function (neighborRows) {
              cleanedList = cleanedList.concat (neighborRows);
              callback (null, cleanedList);
            });
          } else {
            callback (null, cleanedList);
          }

        } else {
          callback (null, []);
        }
      }

    ], function(err, rows) {
      return res.json(rows);
    });

    function makeQuery(query, params, callback) {

      var result = [];

      Airports.query(query, params,
        function (err, found) {

          if (!err && found.rows.length) {
            var uniqCityCountry = {};

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
              found.rows[i].city_full = found.rows[i].city + (found.rows[i].state ? ', ' + found.rows[i].state : ', ' + found.rows[i].country);

              result.push(prepareRow (found.rows[i]));
            }

            for (var i = 0; i < found.rows.length; i++) {
              if (parseInt(uniqCityCountry[found.rows[i].city + found.rows[i].state_short + found.rows[i].country]) != parseInt(uniqCityCountry[found.rows[i].city])) {
                result[i].city = found.rows[i].city_full;
              }
            }

            callback(result);

          } else {

            if (err) {
              sails.log.error(err);
            } else {
              sails.log.info('nothing is found for query', _query);
            }

            callback([]);

          }
        }
      );

    }

    function prepareRow(row) {
      return {
        city: row.city,
        name: row.name,
        value: row.iata_3code,
        pax: row.pax,
        neighbors: row.neighbors ?
          JSON.parse(row.neighbors).slice(0, 2) :
          [
            {
              "iata_3code": "",
              "distance": 0
            },
            {
              "iata_3code": "",
              "distance": 0
            }
          ],
        tokens: row.city.toLowerCase().split(/\s+/).concat(row.name.toLowerCase().split(/\s+/).concat([row.iata_3code.toLowerCase()]))
      };
    }
  }
};

