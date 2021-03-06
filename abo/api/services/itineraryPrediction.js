/* global UserAction */
/* global tPrediction */
/* global EMGA */
/* global iPrediction */
/* global itineraryPrediction */
/* global _ */
/* global memcache */
/* global sails */
module.exports = {
  alpha : sails.config.prediction.itineraries.alpha,
  default_predicted_rank : {
    rankMin : sails.config.prediction.itineraries.rankMin,
    rankMax : sails.config.prediction.itineraries.rankMax
  },
  rankMin : 0,
  rankMax : 0,
  updateRank : function (user, searchUuid, price)
  {
    memcache.get(searchUuid, function(err, result) {
      if (!err && !_.isEmpty(result)) {
        var searchData = JSON.parse(result);
        //get all itineraries
        memcache.get(searchData.itineraryKeys, function (err, itineraries) {
          if (!err && !_.isEmpty(itineraries)) {
            var rankMin = 0;
            var rankMax = 0;
            _.each(itineraries, function (itinerary) {
              itinerary = JSON.parse(itinerary);

              //rank_min = number of itineraries (among the total N returned ones) with price strictly less than P.
              if (parseFloat(itinerary.price) < parseFloat(price)) {
                rankMin++;
              }
              //rank_max = number of itineraries (among the total N returned ones) with price less than or equal to P.
              if (parseFloat(itinerary.price) <= parseFloat(price)) {
                rankMax++;
              }
            });

            //rank_min = rank_min + 1 (this is to avoid zeros in the EMGA computation)
            itineraryPrediction.rankMin = (rankMin + 1)/searchData.itineraryKeys.length;
            sails.log('rankMin: ' + itineraryPrediction.rankMin + ' / ' + searchData.itineraryKeys.length);
            //rank_max = rank_max + 1 (this is for consistency)
            itineraryPrediction.rankMax = (rankMax + 1)/searchData.itineraryKeys.length;
            sails.log('rankMax: ' + itineraryPrediction.rankMax + ' / ' + searchData.itineraryKeys.length);

            sails.log.info(
              {
                calculatedRankMin: itineraryPrediction.rankMin,
                calculatedRankMax: itineraryPrediction.rankMax
              }
            );
            itineraryPrediction.recalculateRank(user, searchData.searchParams, 'local');
            itineraryPrediction.recalculateRank(user, searchData.searchParams, 'global');

          } else {
            sails.log.error('Can\'t find itineraries in memcache for search uuid ', searchUuid);
          }
        });
      } else {
        sails.log.error('Can\'t find search result for uuid ', searchUuid);
      }
    })
  },

  recalculateRank: function (user, params, type) {
    var uuid = null;
    if (type == 'global') {
      uuid = params.CabinClass;
    } else if (type == 'local') {
      uuid = params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode;
    } else {
      sails.log.error('Unsupported rank type!');
      return false;
    }

    iPrediction.getUserItinerariesRank(user, uuid, type, function (current) {
      var data = {
        rankMin: EMGA.update(itineraryPrediction.rankMin, current.rankMin, itineraryPrediction.alpha),
        rankMax: EMGA.update(itineraryPrediction.rankMax, current.rankMax, itineraryPrediction.alpha)
      };

      sails.log.info('Current rank ( from DB or default )', type, current);
      sails.log.info('Recalculated rank (after EMGA(N))', type, data);

      iPrediction.update({user: user, uuid: uuid, type: type}, {prediction: data}).exec(function (err, record) {

        if (err || _.isEmpty(record)) {
          iPrediction.create(
            {
              user          : user,
              uuid          : uuid,
              search_params : params,
              type          : type,
              prediction    : data
            },
            function(err, record) {
              if (err) {
                sails.log.error(err);
              } else {
                UserAction.saveAction(user, 'itinerary_prediction', {uuid: uuid, type: type, data: data});
              }
          });// end of iPrediction.create
        } else {
          UserAction.saveAction(user, 'itinerary_prediction', {uuid: uuid, type: type, data: data});
        }

      });// end of iPrediction.update
    });

  }// end function recalculateRank

};
