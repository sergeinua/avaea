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
          'contains': req.param('q')
        }},
        {'city': {
          'contains': req.param('q')
        }},
        {'iata_3code': {
          'contains': req.param('q')
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
  }
};
