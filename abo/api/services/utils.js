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
    return utils.durationHr(minutes*60*1000, 'd', 'm');
  },
  durationHr: function(ms, top, bottom, zero) {
    // available top, bottom: 'ms', 's', 'm', 'h', 'd'
    // zero: set to true if need to include, zeroes default false
    ms = parseInt(ms);
    var resFull = [];
    var res = [];
    var units = [
      {l: "ms", m: 1000},
      {l: "s", m: 60},
      {l: "m", m: 60},
      {l: "h", m: 24},
      {l: "d", m: false}
    ];
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
        resFull.push(v + units[i].l);
        if (p) res.push(v + units[i].l);
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
  },
  isValidURL: function(value){
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);    
  }  
}
