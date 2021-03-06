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

    var mainSelect = "SELECT "+
      "   name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
      "FROM "+
      Airports.tableName+" "+
      "WHERE "+
      " (iata_3code ~* $1) "+
      " ORDER BY "+
      "   (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, "+
      "   pax DESC, "+
      "   levenshtein($3, city) ASC "+
      "LIMIT " + (_limit ? _limit : 8),

      mainSelect2 = "SELECT "+
      "   name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
      "FROM "+
      Airports.tableName+" "+
      "WHERE "+
      "   (name ~* $1) OR "+
      "   (city ~* $1) OR "+
      "   (alternative_name ~* $3) " +
      " ORDER BY "+
      "   (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, "+
      "   pax DESC, "+
      "   levenshtein($3, city) ASC "+
      "LIMIT " + (_limit ? _limit : 8),

      mainSelect3 = "SELECT "+
      "   name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
      "FROM "+
      Airports.tableName+" "+
      "WHERE "+
      "   (state ~* $1) OR "+
      "   (concat(city,',',state) ~* $1) OR "+
      "   (concat(city,',',state_short) ~* $1) OR "+
      "   (concat(city,',',country) ~* $1) OR "+
      "   (concat(city,' ',state) ~* $1) OR "+
      "   (concat(city,' ',state_short) ~* $1) OR "+
      "   (concat(city,' ',country) ~* $1) OR" +
      "   (country ~* $1)" +
      " ORDER BY "+
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
          if (rows.length) {
            callback(null, rows);
          } else {
            makeQuery(mainSelect2, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows) {
              if (rows.length) {
                callback(null, rows);
              } else {
                makeQuery(mainSelect3, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows) {
                  callback(null, rows);
                })
              }
            })
          }
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
              // sails.log.info('nothing is found for query', _query);
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
  },

  ffm_programs: function (req, res) {
    var program_code = req.param('program_code', false);
    if (program_code) {
      FFMPrograms.findOne({program_code: program_code}).exec(function findOneCB(err, found) {
          if (!found) {
            return res.json({});
          }
          return res.json(found);
        }
      );
    } else {
      return res.json({});
    }
  },

  /**
   * @param {String} id - Itinerary ID ( 2ef4bb98-eb14-4528-982c-8404dade3e77 )
   * */
  ffpcalculate: function (req, res) {
    var id = req.param('id');

    var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
    memcache.get(cacheId, function(err, result) {
      if (!err && !_.isEmpty(result)) {
        ffmapi.milefy.Calculate(JSON.parse(result), function (error, response, body) {
          if (error) {
            return res.json({error: error, body: body});
          }
          var jdata = (typeof body == 'object') ? body : JSON.parse(body);
          return res.json(jdata);
        });
      } else {
        return res.json({error: err});
      }
    });
  },

  airlines: function (req, res) {

    // Trim left whitespaces
    var _query = req.param('q').replace(/^\s*/,"");

    Airlines.find({
      where: {
        or : [
          {name: {'contains': _query}},
          {iata_2code: _query}
        ],
        iata_2code: {'!' : ['','-','--','..','^^','-+',"'"]},
        active: true
      },
      sort: 'name',
      limit: 10
    }).exec(function (err, found) {
      if (err) {
        sails.log.error(err);
      }
      if (found && found.length) {
        for (var i = 0; i < found.length; i++) {
          found[i] = {
            value: found[i].name,
            label: found[i].name +' ('+ found[i].iata_2code +')',
          }
        }
        return res.json(found);
      }
      else {
        return res.json([]);
      }
    });
  },

  getRefundType: function (req, res) {
    var reqParams = req.allParams();
    var id = reqParams.id;
    var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
    memcache.get(cacheId, function(err, result) {
      if (!err && !_.isEmpty(result)) {
        Search.getRefundType(JSON.parse(result), function (err, results) {
          return res.json({error: null, value: results});
        });
      } else {
        return res.json({error: err, value: null});
      }
    });
  }
};

