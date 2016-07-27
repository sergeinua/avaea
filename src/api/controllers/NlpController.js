/**
 * NlpController
 *
 * @description :: Server-side api of nlp page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');

module.exports = {
  index: function (req, res) {
    UserAction.saveAction(req.user, 'nlp_redirect', req.allParams());
    //req.session.flightType = 'voice_search';
    res.cookie('flightType', 'voice_search');
    return res.redirect('/search');
  }
};

