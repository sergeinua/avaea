/**
 * AcController
 *
 * @description :: Server-side logic for managing autocompleting
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  airports: function (req, res) {

    Airports.find({
      or: [
        {'name': {
          'startsWith': req.param('q')
        }},
        {'city': {
          'startsWith': req.param('q')
        }},
        {'iata_3code': {
          'startsWith': req.param('q')
        }}
      ]
    }).where({'iata_3code': {
      '!': ''
    }}).exec(function (err, found) {
      if (!err && found.length) {
        for (var i = 0; i < found.length; i++) {
          //found[i] = found[i].city + ', ' + found[i].name + ' (' + found[i].iata_3code + ')';
          found[i] = {
            city: found[i].city,
            name: found[i].name,
            value: found[i].iata_3code,
            tokens: found[i].city.toLowerCase().split(/\s+/).concat(found[i].name.toLowerCase().split(/\s+/).concat([found[i].iata_3code.toLowerCase()]))
          }

        }
        return res.json(found);
      } else {
        return res.json([]);
      }
    });
  },
  
  // get full list of ffmprograms
  ffmprograms: function (req, res) {
    FFMPrograms.find().exec(function (err, ffm_programs){
        if (err) {
            res.json({error: err});
        }else{
            res.json(ffm_programs);
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
            iata_2code: found[i].iata_2code
          }
        }
        return res.json(found);
      }
      else {
        return res.json([]);
      }
    });
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
        sails.log.error(err);
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
  
};
