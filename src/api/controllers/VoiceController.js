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
        if (sails.config.environment !== 'test')
          segmentio.track(req.user.id, 'Voice Search', {query: _query, result: result});

        return res.json(result); //200
      } else {
        return res.notFound(); //404
      }
    });
  },

  logger: function (req, res) {
    utils.timeLog('search voice');
    if (req.param('q')) {
      var queryResult = req.param('result') || 'failed',
        params = {
        searchParams: req.param('q'),
        queryResult: queryResult
      };
      sails.log.info('Search Voice Params:', params);
      UserAction.saveAction(req.user, 'voice_search', params, function () {
        User.publishCreate(req.user);
      });
      return res.json({'success': true});
    }
    return res.json([]);
  }
};

