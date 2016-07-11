/**
 * VoiceController
 *
 * @description :: Server-side api of voice search
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');

module.exports = {
  parse: function (req, res) {
    var _query = _.trim(req.param('q'));
    return AvaeaTextParser.run(_query, function(err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(); //500
      }
      if (req.wantsJSON) {
        return res.json(result); //200
      } else {
        return res.notFound(); //404
      }
    });
  }
};

