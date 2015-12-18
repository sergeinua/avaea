/* global sails */
module.exports = {
  update: function (N, emga, alpha) {

    alpha = typeof alpha !== 'undefined' ? parseFloat(alpha) : 0.2;
    var current = (typeof emga !== 'undefined' || parseFloat(emga) != 0.0) ? parseFloat(emga) : 0.001;

    sails.log.silly({
      module: 'EMGA',
      N: N,
      emga: emga,
      alpha: alpha
    });

    if ( (alpha <= 0.0) || ( alpha >= 1.0 ) ) {
      //   1 - error: parameter alpha is not strictly between 0 and 1
      sails.log.error('parameter alpha is not strictly between 0 and 1');
      return 0.001;
    }
    if ( parseFloat(N) < 0.0) {
      //   2 - error: N is not positive. Return default
      sails.log.error('N is not positive');
      return 0.001;
    }
    if ( parseFloat(N) == 0) {
      //   [Issue #27] EMGA(0) = 1. Return default
      return 0.001;
    }
    if ( current <= 0.0 ) {
      //   3 - error: the current value of EMGA is not positive. Return default
      sails.log.error('the current value of EMGA is not positive ['+current+'] emga: ['+emga+']');
      return 0.001;
    }

    current = Math.exp( (1.0 - alpha)*Math.log(current) + alpha*Math.log(N) );

    return current;
  }
}
