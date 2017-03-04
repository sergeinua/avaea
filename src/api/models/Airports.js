/**
 * Airports.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
let latinize = require('latinize');

module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      required: true
    },
    name:       { type: 'string' },
    city:       { type: 'string' },
    country:    { type: 'string' },
    iata_3code: { type: 'string' },
    icao_4code: { type: 'string' },
    latitude:   { type: 'float' },
    longitude:  { type: 'float' },
    altitude:   { type: 'float' },
    timezone:   { type: 'integer' },
    dst:        { type: 'string' },
    tz:         { type: 'string' },
    state:      { type: 'string' },
    state_short: { type: 'string' },
    pax:        { type: 'float' },
    neighbors:  { type: 'string' },
    alternative_name: { type: 'string' }
  },
  tableName: 'airports',

  ALL_AIRPORTS_NAME: 'All Airports', // Generic airport name in DB
  DEFAULT_AIRPORTS_LIMIT: 8,

  getAirports: function (_query, _limit, _callback) {
    // São converted into "Sao"
    _query = latinize(_query).replace(/(\W)/g,"$1?");

    let _desiredLimit = _limit ? _limit : Airports.DEFAULT_AIRPORTS_LIMIT;

    var mainSelect = "SELECT "+
        "   id, name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
        "FROM "+
        Airports.tableName+" "+
        "WHERE "+
        " (iata_3code ~* $1) "+
        " ORDER BY "+
        "   (CASE WHEN name=$2 THEN 0 ELSE 1 END) ASC, "+
        "   pax DESC, "+
        "   levenshtein($3, city) ASC "+
        "LIMIT " + _desiredLimit,

      mainSelect2ToLimitFn = (foundCnt = 0) => "SELECT "+
        "   id, name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
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
        "LIMIT " + (_desiredLimit - foundCnt),

      mainSelect3ToLimitFn = (foundCnt = 0) => "SELECT "+
        "   id, name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
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
        "LIMIT " + (_desiredLimit - foundCnt),

      selectNeighbors = "SELECT "+
        "   id, name, city, country, iata_3code, state, state_short, neighbors, concat(city,',',state) as city_state, pax "+
        "FROM "+
        Airports.tableName+" "+
        "WHERE "+
        "   {where} "+
        "ORDER BY "+
        "   (CASE WHEN name=$1 THEN 0 ELSE 1 END) ASC, "+
        "   pax DESC, "+
        "   levenshtein($2, city) ASC "+
        "LIMIT " + _desiredLimit;


    async.waterfall ([

      function(callback) {
        makeQuery(mainSelect, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows1) {
          if (rows1.length >= _desiredLimit) {
            callback(null, rows1);
          } else {
            let mainSelect2 = mainSelect2ToLimitFn(rows1.length);
            makeQuery(mainSelect2, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows2) {
              let rows1_2 = pushUniqRowsOnly(rows1, rows2);
              if (rows1_2.length >= _desiredLimit) {
                callback(null, rows1_2);
              } else {
                let mainSelect3 = mainSelect3ToLimitFn(rows1_2.length);
                makeQuery(mainSelect3, ["^"+_query, Airports.ALL_AIRPORTS_NAME, _query], function(rows3) {
                  let rows1_2_3 = pushUniqRowsOnly(rows1_2, rows3);
                  callback(null, rows1_2_3);
                });
              }
            });
          }
        })
      },

      function(mainRows, callback) {

        var cleanedList =  [], whereCode = "(iata_3code = '{code}')", whereResult = [];
        let processedMainRows = processUniqCityCountry(mainRows);
        if (processedMainRows.length) {
          processedMainRows.forEach (function (item) {
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
              cleanedList = cleanedList.concat(processUniqCityCountry(neighborRows));
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
      return _callback(err, rows);
    });

    function makeQuery(query, params, callback) {

      var result = [];

      Airports.query(query, params,
        function (err, found) {

          if (!err && found.rows.length) {
            for (var i = 0; i < found.rows.length; i++) {
              result.push(found.rows[i]);
            }
            callback(result);
          } else {

            if (err) {
              onvoya.log.error(err);
            } else {
              // onvoya.log.info('nothing is found for query', _query);
            }

            callback([]);

          }
        }
      );

    }

    function processUniqCityCountry(rows) {
      var result = [];
      var uniqCityCountry = {};

      for (var i = 0; i < rows.length; i++) {

        if (!uniqCityCountry[rows[i].city + rows[i].state_short + rows[i].country]) {
          uniqCityCountry[rows[i].city + rows[i].state_short + rows[i].country] = 1;
        } else {
          uniqCityCountry[rows[i].city + rows[i].state_short + rows[i].country]++;
        }
        if (!uniqCityCountry[rows[i].city]) {
          uniqCityCountry[rows[i].city] = 1;
        } else {
          uniqCityCountry[rows[i].city]++;
        }
        //rows[i] = rows[i].city + ', ' + rows[i].name + ' (' + rows[i].iata_3code + ')';
        rows[i].city_full = rows[i].city + (rows[i].state ? ', ' + rows[i].state : ', ' + rows[i].country);

        result.push(prepareRow (rows[i]));
      }

      for (var i = 0; i < rows.length; i++) {
        if (parseInt(uniqCityCountry[rows[i].city + rows[i].state_short + rows[i].country]) != parseInt(uniqCityCountry[rows[i].city])) {
          result[i].city = rows[i].city_full;
        }
      }
      return result;
    }

    function prepareRow(row) {
      return {
        id: row.id,
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
        tokens: (row.city||'').toLowerCase().split(/\s+/).concat((row.name||'').toLowerCase().split(/\s+/).concat([(row.iata_3code||'').toLowerCase()]))
      };
    }

    /**
     * Each row has uniq field id,
     * Push into rows only uniq fields from array otherRows
     *
     * @param {Array} rows
     * @param {Array} otherRows
     */
    function pushUniqRowsOnly(rows, otherRows) {
      let ids = rows.reduce((acc, {id}) => {
        acc[id] = true;
        return acc
      }, {});
      return otherRows.reduce((acc, row) => {
        if (!ids[row.id]) {
          ids[row.id] = true;
          acc.push(row);
        }
        return acc;
      }, rows);
    }
  }
};

