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
        // for (var i = 0; i < found.length; i++) {
        //   //found[i] = found[i].city + ', ' + found[i].name + ' (' + found[i].iata_3code + ')';
        //   found[i] = {
        //     users: found[i],
        //     user: req.user
        //   }

        // }
        sails.log(found);
        return res.view('admin/index', {
            // user: req.user,
            users: found,
            layout: 'admin'
          });
      } else {
        return res.json([]);
      }
    });
  },
  getaction: function (req, res) {
    // sails.log(req.param('lastUpdated'));
    UserAction.find({
      id: {'>':req.param('lastUpdated')}
    }).limit(100).exec(function (err, found) {
      if (!err && found.length) {
        // sails.log(found);
        return res.json({
            userActions: found,
          });
      } else {
        return res.json({userActions:[]});
      }
    });
  }
};
