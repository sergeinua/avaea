/* global sails */
module.exports = {
  update: function (N, emga, alpha) {

    alpha = typeof alpha !== 'undefined' ? parseFloat(alpha) : sails.config.prediction.itineraries.alpha;
    var current = (typeof emga !== 'undefined' || parseFloat(emga) != 0.0) ? parseFloat(emga) : sails.config.prediction.itineraries.rankMin;

    sails.log.silly({
      module: 'EMGA',
      N: N,
      emga: emga,
      alpha: alpha
    });

    if ( (alpha <= 0.0) || ( alpha >= 1.0 ) ) {
      //   1 - error: parameter alpha is not strictly between 0 and 1
      sails.log.error('parameter alpha is not strictly between 0 and 1');
      return sails.config.prediction.itineraries.rankMin;
    }
    if ( parseFloat(N) < 0.0) {
      //   2 - error: N is not positive. Return default
      sails.log.error('N is not positive');
      return sails.config.prediction.itineraries.rankMin;
    }
    if ( parseFloat(N) == 0) {
      //   [Issue #27] EMGA(0) = 1. Return default
      return sails.config.prediction.itineraries.rankMin;
    }
    if ( current <= 0.0 ) {
      //   3 - error: the current value of EMGA is not positive. Return default
      sails.log.error('the current value of EMGA is not positive ['+current+'] emga: ['+emga+']');
      return sails.config.prediction.itineraries.rankMin;
    }

    current = Math.exp( (1.0 - alpha)*Math.log(current) + alpha*Math.log(N) );

    return current;
  }
}
