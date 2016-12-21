/* global sails */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {
    // global['mondee'].readEticket(Search.getCurrentSearchGuid() +'-'+ 'mondee', {pnr: '7CVW5M', reference_number: '13R09XEF7996'}, (err, result) => { // params from API descr
    // global['mondee'].readEticket(Search.getCurrentSearchGuid() +'-'+ 'mondee', {pnr: 'YOATCL', reference_number: '16O16JEF8107'}, (err, result) => {
    //   sails.log.warn('__readEticket', err, result);
    // });

    sails.log.info('req.url', req.url);
    //FIXME this is temporary fix. Needs to be refactored with auth SPA logic updates
    var allowedRoutes = [
      "/about","/about/",
      "/home","/home/",
      "/jobs","/jobs/",
      "/news","/news/",
      "/blog","/blog/",
      "/terms","/terms/",
      "/profile","/profile/",
      "/search","/search/",
      "/privacy","/privacy/"
    ];
    if (allowedRoutes.indexOf(req.url) == -1 && (!req.session.authenticated || !req.user)) {
      return res.redirect('/login');
    }

    if (_.isEmpty(req.session)) {
      req.session = {};
    }
    var tmpDefaultDepDate = sails.moment().add(2, 'w');
    var tmpDefaultRetDate = sails.moment().add(4, 'w');
    var nextFirstDateMonth = sails.moment().add(1, 'M').startOf('month');

    if (nextFirstDateMonth.diff(tmpDefaultDepDate, 'days') > tmpDefaultRetDate.diff(nextFirstDateMonth, 'days')) {
      tmpDefaultRetDate = sails.moment(tmpDefaultDepDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultRetDate = tmpDefaultRetDate.endOf('month');
    } else {
      tmpDefaultDepDate = sails.moment(tmpDefaultRetDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultDepDate = tmpDefaultDepDate.startOf('month');
    }

    var params = {
      DepartureLocationCode     : !_.isString(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode       : !_.isString(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      DepartureLocationCodeCity : !_.isString(req.session.DepartureLocationCodeCity) ? '' : req.session.DepartureLocationCodeCity,
      ArrivalLocationCodeCity   : !_.isString(req.session.ArrivalLocationCodeCity) ? '' : req.session.ArrivalLocationCodeCity,
      CabinClass                : !_.isString(req.session.CabinClass) ? 'E' : req.session.CabinClass,
      departureDate             : _.isEmpty(req.session.departureDate) ? tmpDefaultDepDate.format('YYYY-MM-DD') : req.session.departureDate,
      returnDate                : _.isEmpty(req.session.returnDate) ? tmpDefaultRetDate.format('YYYY-MM-DD') : req.session.returnDate,
      passengers                : _.isUndefined(req.session.passengers) ? '1' : req.session.passengers,
      flightType                : !_.isString(req.session.flightType) ? 'round_trip' : req.session.flightType.toLowerCase()
    };

    return res.ok(
      {
        user         : req.user,
        serviceClass : Search.serviceClass,
        head_title   : 'Search for flights with Avaea Agent',
        page         : req.url,
        defaultSearch: params
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
