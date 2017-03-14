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

    if (req.session && req.session.vanityURL) {  // do redirect if used vanity URL
      // getting of destination URL from vanityURL
      let destinationURL = req.session.vanityURL.destination_url;
      delete req.session.vanityURL;
      onvoya.log.verbose('vanityURL redirected to', destinationURL);
      return res.redirect(destinationURL); //redirect to
    }

    if (req.url.match(/(profile)/) && (!req.session.authenticated || !req.user)) {
      req.session.redirectTo = req.url;
      return res.redirect('/login');
    }
    let page = (!req.url || req.url.trim() == '/') ? '/search' : req.url;

    const params = Search.getDefault(req);
    let passParams = {
      adult: parseInt(req.param('adult', 1)),
      senior: parseInt(req.param('senior', 0)),
      child: parseInt(req.param('child', 0)),
      lapInfant: parseInt(req.param('lapInfant', 0)),
      seatInfant: parseInt(req.param('seatInfant', 0))
    };

    params.DepartureLocationCode = req.param('From', params.DepartureLocationCode);
    params.ArrivalLocationCode = req.param('To', params.ArrivalLocationCode);
    params.CabinClass = req.param('Class', params.CabinClass);
    params.departureDate = req.param('Departure', params.departureDate);
    params.returnDate = req.param('Return', params.returnDate);
    params.passengers = passParams;

    // FIXME: add this parameter when ONV-953 is ready
    //params.referrer = req.param('Ref', params.referrer);

    // FIXME: add this parameter when ONV-938 is ready
    //params.kids = req.param('Kids', params.kids);

    params.departureDate = sails.moment(params.departureDate, Search.dateFormat, true).isValid() ? params.departureDate : '';
    params.returnDate = sails.moment(params.returnDate, Search.dateFormat, true).isValid() ? params.returnDate : '';
    params.flightType = params.returnDate ? 'round_trip' : 'one_way';

    let error = Search.validateSearchParams(params);

    if ((req.params == 'search'  && !error) || (req.params == 'result' && !req.param('s'))) {
      onvoya.log.verbose('Found deeplinking parameters for search form/result');

      async.parallel({
        departure: (doneCb) => {
          Airports.findOne({iata_3code: params.DepartureLocationCode}).exec((_err, _row) => {
            if (_err) {
              onvoya.log.error(_err);
            }
            return doneCb(_err, _row);
          });
        },
        arrival: (doneCb) => {
          Airports.findOne({iata_3code: params.ArrivalLocationCode}).exec((_err, _row) => {
            if (_err) {
              onvoya.log.error(_err);
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
            page         : '/' + req.params,
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
          defaultSearch: params
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
