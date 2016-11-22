/* global sails */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {
    sails.log.info('req.url', req.url);
    //FIXME this is temporary fix. Needs to be refactored with auth SPA logic updates
    if (req.url != '/about' && (!req.session.authenticated || !req.user)) {
      return res.redirect('/login');
    }

    return res.ok(
      {
        user          : req.user,
        serviceClass  : Search.serviceClass,
        head_title    : 'Search for flights with Avaea Agent',
        page: req.url
      },
      'site/index'
    );
  },

  about_info: function (req, res) {
    return res.json({
      site_info:sails.config.globals.site_info
    });
  }
};
