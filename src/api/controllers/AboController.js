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

    User.find({
    }).exec(function (err, found) {
      if (!err && found.length) {
        return res.view('admin/index', {
            users: found,
            layout: 'admin'
          });
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
            userActions:[]
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
        data = tPrediction.adminTiles;
        return res.json({
          data: result
        });
    });
  }
};
