/* global Profile */
/* global Order */
/**
 * BuyController
 */

module.exports = {
  order: function (req, res) {
    var id = 1;// dummy data for test

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
      return res.view('order', {
          title:'You ordered',
          user: req.user,
          Profile: userData,
          order:[
          { itinerary: Order.getById(id) }
          ]
      });
    });

  }
};

