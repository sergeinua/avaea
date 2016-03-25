var timer = {};
module.exports = {
  durationToMinutes: function(duration) {
    var durationArr = /((\d+)[dD]\s*)?((\d+)[hH]\s*)?((\d+)[mM])?/.exec(duration);
    var res = 0;
    if (durationArr) {
      if (durationArr[2]) {
        res += parseInt(durationArr[2])*24*60;
      }
      if (durationArr[4]) {
        res += parseInt(durationArr[4])*60;
      }
      if (durationArr[6]) {
        res += parseInt(durationArr[6]);
      }
    }
    return res;
  },

  minutesToDuration: function(minutes) {
    return utils.durationHr(minutes*60*1000, 'd', 'm', false, true);
  },
  durationHr: function(ms, top, bottom, zero, roundDayMin) {
    // available top, bottom: 'ms', 's', 'm', 'h', 'd'
    // zero: set to true if need to include, zeroes default false
    // roundDayMin: round day-minutes to 1/2hour or hour
    roundDayMin = roundDayMin && ms > 1500000*60; // actual for more then 1-day and 1-hour values
    ms = parseInt(ms);
    if(roundDayMin)
      ms = tileFormatVal.roundTo30mins(ms/60000)*60000;

    var resFull = [];
    var res = [];
    var units = [
      {l: "ms", m: 1000},
      {l: "s", m: 60},
      {l: "m", m: 60},
      {l: "h", m: 24},
      {l: "d", m: false}
    ];
    var hour_suffix = '';
    var rem = ms, p = false;
    // calculate the individual unit values...
    for (var i = 0; i < units.length; i++) {
      if (bottom == units[i].l) {
        p = true;
      }
      if (!units[i].m) {
        resFull.push(rem + units[i].l);
        if (p) res.push(rem + units[i].l);
        break;
      }
      var v = (rem % units[i].m);
      rem -= v;
      rem /= units[i].m;
      if (v || zero) {
        if(roundDayMin && units[i].l == 'm' && v == 30)
          hour_suffix = '&#189;';
        else {
          if(units[i].l == 'h' && hour_suffix != '') // add one-half hour suffix
            v += hour_suffix;
          resFull.push(v + units[i].l);
          if (p) res.push(v + units[i].l);
        }
      }
      if (!rem || top == units[i].l) {
        break;
      }
    }
    if (!res.length) res = resFull;
    return res.reverse().join(' ');
  },
  timeLog: function(label) {
    timer[label] = Date.now();
  },
  timeLogGet: function(label) {
    if (timer[label]) {
      return Date.now() - timer[label];
    } else {
      return 0;
    }
  },
  timeLogGetHr: function(label) {
    return utils.durationHr(utils.timeLogGet(label));
  }
}
