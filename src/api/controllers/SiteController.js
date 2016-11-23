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
      DepartureLocationCode     : _.isEmpty(req.session.DepartureLocationCode) ? '' : req.session.DepartureLocationCode,
      ArrivalLocationCode       : _.isEmpty(req.session.ArrivalLocationCode) ? '' : req.session.ArrivalLocationCode,
      DepartureLocationCodeCity : _.isEmpty(req.session.DepartureLocationCodeCity) ? '' : req.session.DepartureLocationCodeCity,
      ArrivalLocationCodeCity   : _.isEmpty(req.session.ArrivalLocationCodeCity) ? '' : req.session.ArrivalLocationCodeCity,
      CabinClass                : _.isEmpty(req.session.CabinClass) ? 'E' : req.session.CabinClass,
      departureDate             : _.isEmpty(req.session.departureDate) ? tmpDefaultDepDate.format('YYYY-MM-DD') : req.session.departureDate,
      returnDate                : _.isEmpty(req.session.returnDate) ? tmpDefaultRetDate.format('YYYY-MM-DD') : req.session.returnDate,
      passengers                : _.isEmpty(req.session.passengers) ? '1' : req.session.passengers,
      flightType                : _.isEmpty(req.session.flightType) ? 'round_trip' : req.session.flightType.toLowerCase()
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
