/* global Profile */
/* global UserAction */
/* global User */
/* global sails */
/**
 * TurkController
 *
 * @description :: Server-side logic for Turk page
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  index: function (req, res) {
    // build 'turk' data from last search of the current authorized user
    // req.user.id

    console.log(req.user);

    var data = {};

    return res.view('turk/generate', {

      departure: data.departure,
      departureDate: data.departureDate,

      arrival: data.arrival,
      arrivalDate: data.arrivalDate,

      cabinClass: data.cabinClass,
      passengers: data.passengers,
      flightType: data.flightType

    });
  }

};
