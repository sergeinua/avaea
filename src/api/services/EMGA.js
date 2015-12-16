/* global sails */
module.exports = {
  alpha : 0.2, // [Issue #27] Set alpha=0.2 for now
  current : 0.0000001, // [Issue #27] EMGA(0) = 1
  update: function (N, emga, alpha) {

    this.alpha = typeof alpha !== 'undefined' ? alpha : 0.2;
    this.current = (typeof emga !== 'undefined' || parseFloat(emga) != 0.0) ? parseFloat(emga) : 0.0000001;

    // sails.log.info({
    //   module: 'EMGA',
    //   N: N,
    //   emga: emga,
    //   alpha: alpha
    // });

    if ( (parseFloat(this.alpha) <= 0.0) || ( parseFloat(this.alpha) >= 1.0 ) ) {
      //   1 - error: parameter alpha is not strictly between 0 and 1
      sails.log.error('parameter alpha is not strictly between 0 and 1');
      return 0.0000001;
    }
    if ( parseFloat(N) < 0.0) {
      //   2 - error: N is not positive. Return default
      sails.log.error('N is not positive');
      return 0.0000001;
    }
    if ( parseFloat(N) == 0) {
      //   [Issue #27] EMGA(0) = 1. Return default
      return 1;
    }
    if ( parseFloat(this.current) <= 0.0 ) {
      //   3 - error: the current value of EMGA is not positive. Return default
      sails.log.error('the current value of EMGA is not positive ['+this.current+'] emga: ['+emga+']');
      return 0.0000001;
    }

    this.current = Math.exp( (1.0-parseFloat(this.alpha))*Math.log(parseFloat(this.current)) + parseFloat(this.alpha)*Math.log(parseFloat(N)) );

    return this.current;
  }
}
