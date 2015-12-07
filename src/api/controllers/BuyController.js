/* global UserAction */
/* global memcache */
/* global sails */
/* global Profile */
/* global Order */
/**
 * BuyController
 */

module.exports = {
  order: function (req, res) {

    Profile.findOneByUserId(req.user.id).exec(function findOneCB(err, found) {
      var userData = {};
      if (!found) {
        userData = {
          firstName: '',
          lastName: '',
        };
      } else {
        userData = {
          firstName: found.firstName,
          lastName: found.lastName,
        };
      }

      var id = req.param('id');

      var cacheId = 'itinerary_' + id.replace(/\W+/g, '_');
      memcache.get(cacheId, function(result) {
        if (result) {
          var logData = {
            action    : 'order',
            itinerary : JSON.parse(result)
          };
  
          UserAction.saveAction(req.user, 'on_itinerary_purchase', logData);
          return res.view('order', {
              title:'You ordered',
              user: req.user,
              Profile: userData,
              order:[JSON.parse(result)]
          });
        } else {
          req.session.flash = 'Cash is expiried. Try new search.';
          req.flash('errors', req.session.flash);
          res.redirect('/search');
        }
      });

    });

  }
};

