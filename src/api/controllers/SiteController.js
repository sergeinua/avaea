/* global sails */
/* global async */
/* global _ */
/* global Search */
/* global Airports */
/* global UserAction */
/**
 * SiteController
 *
 * @description :: Simple site pages
 */

module.exports = {

  index: function (req, res) {
    UserAction.saveFirstVisit(req, res);
    if (req.url.match(/(profile|order|booking)/) && (!req.session.authenticated || !req.user)) {
      req.session.redirectTo = req.url;
      return res.redirect('/login');
    }
    let page = (!req.url || req.url.trim() == '/') ? '/search' : req.url;

    let params = Search.getDefault(req);
    //map parameters to our structure
    params = {
      DepartureLocationCode : req.param('From', ''),   // departure airport code
      ArrivalLocationCode   : req.param('To', ''),     // destination airport code
      CabinClass            : req.param('Class', 'E'), // booking class, if any
      departureDate         : req.param('Dep'),        // departure date)
      returnDate            : req.param('Return'),     // return date, if any
      passengers            : req.param('Pass', '1'),  // number of adult passengers, if any
      // FIXME: add this parameter when ONV-953 is ready
      // referrer              : req.param('ref', ''),    // a referrer name; could be a name of a partner, or ad campaign
      // FIXME: add this parameter when ONV-938 is ready
      //req.param('kids') // number of kids, if any
    };

    let departureDate = sails.moment(params.departureDate, 'YYYY-MM-DD');
    let returnDate = sails.moment(params.returnDate, 'YYYY-MM-DD');

    params.departureDate = departureDate.isValid()?departureDate.format('DD/MM/YYYY'):'';
    params.returnDate = returnDate.isValid()?returnDate.format('DD/MM/YYYY'):'';

    params.flightType = params.returnDate?'round_trip':'one_way';
    let error = Search.validateSearchParams(params);

    if (req.params == 'search' && !error ) {
      params.departureDate = departureDate.isValid()?departureDate.format('YYYY-MM-DD'):'';
      params.returnDate = returnDate.isValid()?returnDate.format('YYYY-MM-DD'):'';

      sails.log.verbose('Found valid parameters for search form');

      async.parallel({
        departure: (doneCb) => {
          Airports.findOne({iata_3code: params.DepartureLocationCode}).exec((_err, _row) => {
            if (_err) {
              sails.log.error(_err);
            }
            return doneCb(_err, _row);
          });
        },
        arrival: (doneCb) => {
          Airports.findOne({iata_3code: params.ArrivalLocationCode}).exec((_err, _row) => {
            if (_err) {
              sails.log.error(_err);
            }
            return doneCb(_err, _row);
          });
        }
      }, (err, result) => {
        if (result.departure && result.departure.city) {
          params.DepartureLocationCodeCity = result.departure.city;
        } else {
          params.DepartureLocationCode = '';
        }

        if (result.arrival && result.arrival.city) {
          params.ArrivalLocationCodeCity = result.arrival.city;
        } else {
          params.ArrivalLocationCode = '';
        }
        params.forceDefault = true;

        return res.ok(
          {
            user         : req.user || '',
            serviceClass : Search.serviceClass,
            head_title   : 'Search for flights with OnVoya Agent',
            page         : '/search',
            defaultSearch: params
          },
          'site/index'
        );

      });
    } else {
      return res.ok(
        {
          user: req.user || '',
          serviceClass: Search.serviceClass,
          head_title: 'Search for flights with OnVoya Agent',
          page: page,
          defaultSearch: Search.getDefault(req)
        },
        'site/index'
      );
    }
  },

  about_info: function (req, res) {
    return res.json({
      site_info:sails.config.globals.site_info
    });
  }
};
