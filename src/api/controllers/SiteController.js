/* global sails */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {
    sails.log.info('req.url', req.url);
    return res.ok(
      {
        // title         : 'Search for flights',
        user          : req.user,
        // defaultParams : params,
        serviceClass  : Search.serviceClass,
        // errors        : error,
        head_title    : 'Search for flights with Avaea Agent',
        page: req.url
      },
      'site/index'
    );
  },

  indexOld: function (req, res) {

    var site_pages = ['about'];
    var page_name = req.param('page_name');

    if (site_pages.indexOf(page_name) == -1) {
      return res.notFound();
    }

    return res.ok(
      {
        site_info: sails.config.globals.site_info,
        user: (req.user ? req.user : null)
      },
      'site/' + page_name
    );
  },

  about_info: function (req, res) {
    return res.json({
      site_info:sails.config.globals.site_info,
      // user: {email: user.email, id: user.id }
    });
  }
};
