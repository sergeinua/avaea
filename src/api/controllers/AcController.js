/* global FFMPrograms */

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
    var _limit = parseInt(req.param('l', 8));

    Airports.getAirports(_query, _limit, function (err, result) {
      if (err) {
        onvoya.log.error(err);
        return res.json([]);
      } else {
        return res.json(result)
      }
    });
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

  ffm_airlines: function (req, res) {
    var _query = req.param('q').replace(/^\s*/,"");

    FFMPrograms.find({
      where: {
        or : [
          {program_name: {'contains': _query}},
          {program_code: _query},
          {alliance: _query}
        ]
      },
      sort: 'program_name'
    }).exec(function (err, found) {
      if (err) {
        onvoya.log.error(err);
      }
      if (found && found.length) {
        for (var i = 0; i < found.length; i++) {
          found[i] = {
            value: found[i].program_code,
            label: found[i].program_name,
            tier: found[i].tiers_configuration
          }
        }
        return res.json(found);
      }
      else {
        return res.json([]);
      }
    })
  },

  /**
   * @param {Array} ids - [Itinerary ID ( 2ef4bb98-eb14-4528-982c-8404dade3e77 )]
   * */
  ffpcalculateMany: function (req, res) {
    var ids = req.param('ids');
    if (ids && ids.length) {
      let cacheIds = ids.map((id) => 'itinerary_' + id.replace(/\W+/g, '_'));
      cache.getByArrayKeys(cacheIds, function (err, result) {
        if (!err && !_.isEmpty(result)) {
          var skipedIds = [];

          var resultObject = {};
          if (cacheIds.length == 1 || typeof result == "string") {
            resultObject[cacheIds[0]] = result;
          } else {
            resultObject = result;
          }
          var resultParsed = Object.keys(resultObject)
            .map((itineraryId) => {
                try {
                  return JSON.parse(resultObject[itineraryId]);
                } catch (error) {
                  skipedIds.push(itineraryId);
                  return false;
                }
              }
            );
          var resultParsedNoErrors = resultParsed.filter((itinerary) => itinerary !== false);
          FFMPrograms.getMilesProgramsByUserId(req.user && req.user.id)
            .then(function (milesPrograms) {
            ffmapi.milefy.Calculate({itineraries: resultParsedNoErrors, milesPrograms}, function (error, body) {
              if (error) {
                return res.json({error: error, body: body});
              }
              var jdata = (typeof body == 'object') ? body : JSON.parse(body);
              return res.json({itineraries: jdata});
            });
          });
        } else {
          return res.json({error: err});
        }
      });
    }
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
        onvoya.log.error(err);
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
    cache.get(cacheId, function(err, result) {
      if (!err && !_.isEmpty(result)) {
        Search.getRefundType(JSON.parse(result), function (e, r) {
          return res.json({error: e, value: r});
        });
      } else {
        return res.json({error: err, value: ''});
      }
    });
  },

  getNearestAirport: function (req, res) {
    let ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.ip;
    let geo = require('geoip-lite').lookup(ip);
    let send = {airport:''};

    if (geo && !_.isEmpty(geo.ll)) {
      const _query = 'SELECT * FROM ' +
        Airports.tableName + ' WHERE pax > 1 ORDER BY ' +
        '(select  (point($1, $2) <@> point(airports.longitude,airports.latitude)) as distance), pax limit 1';

      const params = [
        geo.ll[1], // longitude by IP
        geo.ll[0], // latitude by IP
      ];

      Airports.query(
        _query,
        params,
        function (err, result) {
          if (err) {
            onvoya.log.error(err);
          } else {
            if (result.rows && result.rows.length && !_.isUndefined(result.rows[0].iata_3code)) {
                send.airport = result.rows[0].iata_3code;
            } else {
              onvoya.log.info('No location found for user IP', ip);
            }
          }
          return res.json(send);
        }
      );
    } else {
      onvoya.log.info('No location found for user IP', ip);
      return res.json(send);
    }
  }
};

