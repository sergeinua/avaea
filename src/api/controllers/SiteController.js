/* global sails */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {
    if (req.url.match(/(profile|order|booking)/) && (!req.session.authenticated || !req.user)) {
      req.session.redirectTo = req.url;
      return res.redirect('/login');
    }
    let page = req.url;

    if (!req.url || req.url.trim() == '/') {
      page = req.isMobile ? '/search':'/home';
    }

    if (_.isEmpty(req.session)) {
      req.session = {};
    }
    let tmpDefaultDepDate = sails.moment().add(2, 'w');
    let tmpDefaultRetDate = sails.moment().add(4, 'w');
    let nextFirstDateMonth = sails.moment().add(1, 'M').startOf('month');

    if (nextFirstDateMonth.diff(tmpDefaultDepDate, 'days') > tmpDefaultRetDate.diff(nextFirstDateMonth, 'days')) {
      tmpDefaultRetDate = sails.moment(tmpDefaultDepDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultRetDate = tmpDefaultRetDate.endOf('month');
    } else {
      tmpDefaultDepDate = sails.moment(tmpDefaultRetDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
      tmpDefaultDepDate = tmpDefaultDepDate.startOf('month');
    }

    let params = {
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
        user         : req.user || '',
        serviceClass : Search.serviceClass,
        head_title   : 'Search for flights with Onvoya Agent',
        page         : page,
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
