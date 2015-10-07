/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  homepage: function (req, res) {
    if (req.session.authenticated) {
      res.redirect('/search');
    }
  }
};

