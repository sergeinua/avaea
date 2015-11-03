/* global Order */
/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  order: function (req, res) {
    var id = 1;// dummy data for test
    return res.view('order', {
        title:'You ordered',
        user: req.user,
        order:[
        { itinerary: Order.getById(id) }
        ]
    });
  }
};

