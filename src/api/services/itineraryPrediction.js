/* global UserAction */
/* global tPrediction */
/* global EMGA */
/* global iPrediction */
/* global itineraryPrediction */
/* global _ */
/* global memcache */
/* global sails */
module.exports = {
  alpha : 0.2,
  default_predicted_rank : {
    rankMin : 0,
    rankMax : 1
  },
  rankMin : 0,
  rankMax : 0,
  updateRank : function (user, searchUuid, price)
  {
    memcache.get(searchUuid, function(result) {
      if (!_.isEmpty(result)) {
        var searchData = JSON.parse(result);
        // sails.log.info(searchData);
        //get all itineraries
        memcache.get(searchData.itineraryKeys, function (itineraries) {
          // sails.log(itineraries.length);
          if (!_.isEmpty(itineraries)) {
            itineraryPrediction.rankMin = 0;
            itineraryPrediction.rankMax = 0;
            _.each(itineraries, function (itinerary) {
              itinerary = JSON.parse(itinerary);
              // sails.log.info({
                // price: price,
                // itineraryPrice: itinerary.price
              // });
              // sails.log.info(itinerary);
              //rank_min = number of itineraries (among the total N returned ones) with price strictly less than P.
              if (parseFloat(itinerary.price) < parseFloat(price)) {
                itineraryPrediction.rankMin++;
              }
              //rank_max = number of itineraries (among the total N returned ones) with price less than or equal to P.
              if (parseFloat(itinerary.price) <= parseFloat(price)) {
                itineraryPrediction.rankMax++;
              }
            });
            
            //rank_min = rank_min + 1 (this is to avoid zeros in the EMGA computation)
            itineraryPrediction.rankMin = (itineraryPrediction.rankMin + 1)/searchData.itineraryKeys.length;
            //rank_max = rank_max + 1 (this is for consistency)
            itineraryPrediction.rankMax = (itineraryPrediction.rankMax + 1)/searchData.itineraryKeys.length;

            sails.log.info(
              {
                calculatedRankMin: itineraryPrediction.rankMin,
                calculatedRankMax: itineraryPrediction.rankMax
              }
            );
            // searchData.searchParams
            itineraryPrediction.recalculate_global_rank(user, searchData.searchParams.CabinClass, searchData.searchParams);
            itineraryPrediction.recalculate_local_rank(
              user,
              searchData.searchParams.CabinClass,
              searchData.searchParams.DepartureLocationCode,
              searchData.searchParams.ArrivalLocationCode,
              searchData.searchParams
            );

          } else {
            sails.log.error('Can\'t find itinerary');
          }
        });
      } else {
        sails.log.error('Can\'t find search');
      }
    })
  },
  // user U
  // given class of service C
  // from airport A1
  // to airport A2
  //Suppose the user got back a list of N itineraries and decides to buy itinerary I with price P.
  recalculate_global_rank: function (user, serviceClass, params) {
    iPrediction.getUserItinerariesRank(user, serviceClass, 'global', function (current) {
      var data = {
        rankMin: EMGA.update(itineraryPrediction.rankMin, current.rankMin, itineraryPrediction.alpha),
        rankMax: EMGA.update(itineraryPrediction.rankMax, current.rankMax, itineraryPrediction.alpha)
      };
      sails.log('Current EMGA');
      sails.log.info(current);
      sails.log('Recalculated EMGA');
      sails.log.info(data);
      iPrediction.update({user: user, uuid: serviceClass, type:'global'}, {prediction: data}).exec(function (err, record) {

        if (err || _.isEmpty(record)) {
          iPrediction.create(
            {
              user          : user,
              uuid          : serviceClass,
              search_params : params,
              type          : 'global',
              prediction    : data
            },
            function(err, record) {
              if (err) {
                sails.log.error(err);
              } else {
                UserAction.saveAction(user, 'itinerary_prediction', {uuid: serviceClass, type : 'global', data : data});
              }
          });
        } else {
          UserAction.saveAction(user, 'itinerary_prediction', {uuid: serviceClass, type : 'global', data : data});
        }

      });
    });

  },

  recalculate_local_rank: function (user, serviceClass, airportFrom, airportTo, params) {
    var uuid = serviceClass + '_' + airportFrom + '_' + airportTo;
    iPrediction.getUserItinerariesRank(user, uuid, 'local', function (current) {
      var data = {
        rankMin: EMGA.update(itineraryPrediction.rankMin, current.rankMin, this.alpha),
        rankMax: EMGA.update(itineraryPrediction.rankMax, current.rankMax, this.alpha)
      };
      sails.log('local rank data');
      sails.log(data);
      iPrediction.update({user: user, uuid: uuid, type:'local'}, {prediction: data}).exec(function (err, record) {

        if (err || _.isEmpty(record)) {
          iPrediction.create(
            {
              user          : user,
              uuid          : uuid,
              search_params : params,
              type          : 'local',
              prediction    : data
            },
            function(err, record) {
              if (err) {
                sails.log.error(err);
              } else {
                UserAction.saveAction(user, 'itinerary_prediction', {uuid: uuid, type : 'local', data : data});
              }
          });
        } else {
          UserAction.saveAction(user, 'itinerary_prediction', {uuid: uuid, type : 'local', data : data});
        }

      });
    });
  }
}
