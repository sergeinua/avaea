/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  order: function (req, res) {
    var id = 1;// tmp
    return res.view('order', {
        user: res.user,
        order:[
        { itinerary: sails.models.Order.getById(id) }
        ]
    });
  }
};

