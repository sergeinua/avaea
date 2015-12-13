/* global sails */
module.exports = {
  alpha : 0.2,     // [Issue #27] Set alpha=0.2 for now
  current : 1, // [Issue #27] EMGA(0) = 1
  update: function (N, emga, alpha) {
    this.alpha = typeof alpha !== 'undefined' ? alpha : 0.2;
    this.current = typeof emga !== 'undefined' ? emga : 1;
    if ( (this.alpha <= 0.0) || ( this.alpha >= 1.0 ) ) { 
      //   1 - error: parameter alpha is not strictly between 0 and 1
      sails.log.error('parameter alpha is not strictly between 0 and 1');
      return 1;
    }
    if ( N < 0.0) {
      //   2 - error: N is not positive
      sails.log.error('N is not positive');
      return 2;
    }
    if ( N == 0) {
      //   [Issue #27] EMGA(0) = 1
      return 1;
    }
    if ( this.current <= 0.0 ) {
      //   3 - error: the current value of EMGA is not positive
      sails.log.error('the current value of EMGA is not positive');
      return 3;
    }

    this.current = Math.exp( (1.0-this.alpha)*Math.log(this.current) + this.alpha*Math.log(N) );

    return 0;
  }
}
