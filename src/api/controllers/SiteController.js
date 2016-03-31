/* global sails */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {

    var site_pages = ['about'];
    var page_name = req.param('page_name');

    if(site_pages.indexOf(page_name) == -1)
      return res.notFound();

    return res.view('site/'+page_name, {
      site_info: sails.config.globals.site_info
    });
  }
};
