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
        sails.log.error(err);
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
        Search.getRefundType(JSON.parse(result), function (e, r) {
          return res.json({error: e, value: r});
        });
      } else {
        return res.json({error: err, value: ''});
      }
    });
  },

  getNearestAirport: function (req, res) {
    let ip = req.ip;
    let geo = require('geoip-lite').lookup(ip);
    let send = {airport:''};

    if (geo && !_.isUndefined(geo.city)) {
      Airports.getAirports(geo.city, 1, function (err, result) {
        if (err) {
          sails.log.error(err);
        } else {
          if (result && !_.isUndefined(result[0].value)) {
            send.airport = result[0].value;
          } else {
            sails.log.info('No location found for user IP', ip);
          }
        }
        return res.json(send);
      });
    } else {
      sails.log.info('No location found for user IP', ip);
      return res.json(send);
    }
  }
};

