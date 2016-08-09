
var durationHr = function(ms, top, bottom, zero) {
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
};