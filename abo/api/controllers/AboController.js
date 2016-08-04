/* global UserAction */
/* global User */
/* global tPrediction */
/* global sails */
/**
 * AboController
 *
 * @description :: Server-side logic for admin page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  index: function (req, res) {

    var selectedAirline = '';

    if (req.params.selectedAirline && req.params.selectedAirline.length == 2 ) {
      selectedAirline = req.params.selectedAirline.toUpperCase();
      console.log('selectedAirline in params: ' + selectedAirline);
    }

    User.find({}).exec(function (err, found) {
      if (!err && found.length) {
        return res.view('admin/index', {
            selectedAirline: selectedAirline,
            users: found,
            layout: 'admin'
          });
      } else {
        return res.json([]);
      }
    });
  },
  getActionByType: function (req, res) {
    UserAction.find({
      where: {
        id: {'>':req.param('lastUpdated', 0)},
        actionType: req.param('actionType', 'search')
      },
      sort : 'id ASC'
    }).populate('user').exec(function (err, found) {
      if (!err && found.length) {
        return res.json(found);
      } else {
        return res.json([]);
      }
    });
  },
  getaction: function (req, res) {
    UserAction.find({
      where: {id: {'>':req.param('lastUpdated', 0)}},
      sort : 'id ASC'
    }).exec(function (err, found) {
      if (!err && found.length) {
        return res.json({
            userActions: _.last(found,10)
          });
      } else {
        return res.json({
            userActions:[]
          });
      }
    });
  },
  getByUser: function (req, res) {
    var userId = req.param('user_id', 0);
    if (!userId) {
      sails.log.error('Cant find user');
      return res.json({
        userActions:[]
      });
    }
    UserAction.find({
      where:{
        id: {
          '>': req.param('lastUpdated', 0)
        },
        user: userId
      },
      sort : 'id ASC'
    }).exec(function (err, found) {
      if (!err && found.length) {
        return res.json({
            userActions: _.last(found, 30)
          });
      } else {
        return res.json({
            userActions:[{
              actionType: 'empty',
              user: userId,
              createdAt: 0,
              id: 0,
              logInfo: {error: 'Cant find actions data for user id #' + userId}
            }]
          });
      }
    });
  },
  getTilesByUser: function (req, res) {
    var userId = req.param('user_id', 0);

    if (!userId) {
      sails.log.error('Cant find user id ', userId);
      return res.json({
        data:{error:'user not found'}
      });
    }
    var serviceClass = [
      'E',//'Economy',
      'P',//'Premium',
      'B',//'Business',
      'F' //'First'
    ];
    var data = [];

    async.parallel([
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'E', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'P', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'B', callback);
        },
        function (callback) {
            tPrediction.getUserTilesCb(userId, 'F', callback);
        }
    ], function(err, result) {
      //sails.log.info("__getTilesByUser:", require('util').inspect(result, {showHidden: true, depth: null})); // dev debug
        data = tPrediction.adminTiles;
        return res.json({
          data: result
        });
    });
  }
};
