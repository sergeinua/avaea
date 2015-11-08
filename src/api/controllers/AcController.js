/**
 * AcController
 *
 * @description :: Server-side logic for managing autocompleting
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  airports: function (req, res) {

    Airports.find()/*.find({
      or: [
        {'name': {
          'startsWith': req.param('q')
        }},
        {'iata_3code': {
          'startsWith': req.param('q')
        }}
      ]
    }).where({'iata_3code': {
        '!': ''
    }})*/.where({'iata_3code': {
      'startsWith': req.param('q')
    }}).exec(function (err, found) {
      if (!err && found.length) {
        for (var i = 0; i < found.length; i++) {
          found[i] = /*found[i].name + ' (' + */found[i].iata_3code/* + ')'*/;

        }
        return res.json(found);
      } else {
        return res.json([]);
      }
    });
  }
};
