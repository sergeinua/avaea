/**
 * AcController
 *
 * @description :: Server-side logic for managing autocompleting
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  airports: function (req, res) {

    // Trim left whitespaces
    var _query = req.param('q').replace(/^\s*/,"");

    Airports.find({
      or: [
        {'name': {
          'startsWith': _query
        }},
        {'city': {
          'startsWith': _query
        }},
        {'iata_3code': {
          'startsWith': _query
        }}
      ],
      sort: 'pax DESC'
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
  }
};
