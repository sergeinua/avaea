/* global UserAction */
/* global tPrediction */
/* global EMGA */
/* global iPrediction */
/* global itineraryPrediction */
/* global _ */
/* global cache */
/* global sails */
module.exports = {
  alpha : sails.config.prediction.itineraries.alpha,
  default_predicted_rank : {
    rankMin : sails.config.prediction.itineraries.rankMin,
    rankMax : sails.config.prediction.itineraries.rankMax
  },
  rankMin : 0,
  rankMax : 0,
  updateRank : function (userId, searchUuid, price)
  {
    cache.get(searchUuid, function(err, result) {
      if (!err && !_.isEmpty(result)) {
        var searchData = JSON.parse(result);
        //get all itineraries
        cache.getByArrayKeys(searchData.itineraryKeys, function (err, itineraries) {
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
            onvoya.log.debug('rankMin: ' + itineraryPrediction.rankMin + ' / ' + searchData.itineraryKeys.length);
            //rank_max = rank_max + 1 (this is for consistency)
            itineraryPrediction.rankMax = (rankMax + 1)/searchData.itineraryKeys.length;
            onvoya.log.debug('rankMax: ' + itineraryPrediction.rankMax + ' / ' + searchData.itineraryKeys.length);

            onvoya.log.info(
              {
                calculatedRankMin: itineraryPrediction.rankMin,
                calculatedRankMax: itineraryPrediction.rankMax
              }
            );
            itineraryPrediction.recalculateRank(userId, searchData.searchParams, 'local');
            itineraryPrediction.recalculateRank(userId, searchData.searchParams, 'global');

          } else {
            onvoya.log.error('Can\'t find itineraries in cache for search uuid ', searchUuid);
          }
        });
      } else {
        onvoya.log.error('Can\'t find search result for uuid ', searchUuid);
      }
    })
  },

  recalculateRank: function (userId, params, type) {
    var uuid = null;
    if (type == 'global') {
      uuid = params.CabinClass;
    } else if (type == 'local') {
      uuid = params.CabinClass + '_' + params.DepartureLocationCode + '_' + params.ArrivalLocationCode;
    } else {
      onvoya.log.error('Unsupported rank type!');
      return false;
    }

    iPrediction.getUserItinerariesRank(userId, uuid, type, function (current) {
      var data = {
        rankMin: EMGA.update(itineraryPrediction.rankMin, current.rankMin, itineraryPrediction.alpha),
        rankMax: EMGA.update(itineraryPrediction.rankMax, current.rankMax, itineraryPrediction.alpha)
      };

      onvoya.log.info('Current rank ( from DB or default )', type, current);
      onvoya.log.info('Recalculated rank (after EMGA(N))', type, data);

      iPrediction.update({user_id: userId, uuid: uuid, type: type}, {prediction: data}).exec(function (err, record) {

        if (err || _.isEmpty(record)) {
          iPrediction.create(
            {
              user_id       : userId,
              uuid          : uuid,
              search_params : params,
              type          : type,
              prediction    : data
            },
            function(err, record) {
              if (err) {
                onvoya.log.error(err);
              } else {
                UserAction.saveAction(userId, 'itinerary_prediction', {uuid: uuid, type: type, data: data});
              }
          });// end of iPrediction.create
        } else {
          UserAction.saveAction(userId, 'itinerary_prediction', {uuid: uuid, type: type, data: data});
        }

      });// end of iPrediction.update
    });

  }// end function recalculateRank

};
