/* global UserAction */
/* global User */
/**
 * AcController
 *
 * @description :: Server-side logic for managing autocompleting
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
    }).limit(100).exec(function (err, found) {
      if (!err && found.length) {
        return res.json({
            userActions: found
          });
      } else {
        return res.json({
            userActions:[]
          });
      }
    });
  }
};
