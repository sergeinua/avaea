
var convertToHours = function (timeMinutes) {

  timeMinutes = roundTo30mins(timeMinutes, true);
  var hours = parseInt(timeMinutes/60);
  var minutes = (timeMinutes % 60) ? ":30" : "";

  if (hours == 0 || hours == 24) {
    return (minutes=="" || hours == 24) ? '12m' : ('0' + minutes +'am');
  }
  else if (hours < 12) {
    return hours + minutes +'am';
  }
  else if (hours == 12) {
    return (minutes=="") ? '12n' : ('0' + minutes +'pm');
  }
  else if (hours > 12) {
    hours -= 12;
    return hours + minutes +'pm';
  }
};

/**
 * Round to the nearest full/half-hour
 *
 * @param {number} durationMinutes
 * @param {boolean} isTime If true then round for day time. Otherwise - parse as duration
 * @returns {number}
 */
var roundTo30mins = function (durationMinutes, isTime) {
  var durationMinutesRounded = parseInt(durationMinutes/60) * 60;
  var _remain = durationMinutes % 60;

  if (_remain > 45) {
    if(!(isTime && durationMinutesRounded/60 >= 24))
      durationMinutesRounded += 60;
  }
  else if (_remain > 15) {
    durationMinutesRounded += 30;
  }
  return durationMinutesRounded;
};

var formatMinutes = function (time) {
  time = roundTo30mins(time);
  return parseInt(time/60) + ((time % 60) ? '&#189;h' : 'h');
  //return parseInt(time/60) + ((time % 60) ? '.5h' : 'h');
};

module.exports = {

  convertToHours : convertToHours,
  roundTo30mins : roundTo30mins,

  /**
   * Set title value for Tile filter by time
   *
   * @param {number} value1 Minutes
   * @param {number} value2 Minutes
   * @param {number} res_type 1=One fixed value; 2=Two fixed value as val1[, val2]; otherwise=range as val1[ - val2]
   * @returns {string}
   */
  setFilterTitleTime: function (value1, value2, res_type) {
    var _res;
    value1 = convertToHours(value1);

    // Only one fix value
    if(res_type == 1) {
      _res = value1;
    }
    else { // Two values or Range
      _res = value1;
      if(value2) {
        value2 = convertToHours(value2);
        if(value1 != value2)
          _res = _res +(res_type == 2 ? ', ' : ' - ')+ value2;
          //_res = _res +(res_type == 2 ? ', ' : ' &ndash; ')+ value2;
      }
    }

    return _res;
  },

  setFilterTitlePrice: function (value1, value2, res_type) {
    var _res;
    value1 = parseInt(value1);

    // Only one fix value
    if(res_type == 1) {
      _res = '$' + value1;
    }
    else if(res_type == 2) { // Two values
      _res = '$' + value1;
      if(value2) {
        value2 = parseInt(value2);
        if(value1 != value2)
          _res = _res +', $'+ value2;
      }
    }
    else { // Range
      _res = '$' + value1;
      if(value2) {
        value2 = parseInt(value2);
        if(value1 != value2)
          _res = _res +'<span class="visible-xs-inline">+</span> <span class="hidden-xs" style="color:gray"> &ndash; $'+ value2 +'</span>';
      }
    }

    return _res;
  },

  setFilterTitleDuration: function (value1, value2, res_type) {
    var _res;
    value1 = formatMinutes(value1);

    // Only one fix value
    if(res_type == 1) {
      _res = value1;
    }
    else { // Two values or Range
      _res = value1;
      if(value2) {
        value2 = formatMinutes(value2);
        if(value1 != value2)
          _res = _res +(res_type == 2 ? ', ' : ' &ndash; ')+ value2;
      }
    }

    return _res;
  }
};
