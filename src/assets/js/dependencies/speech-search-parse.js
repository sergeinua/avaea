var speechSearchParse = {

  parseDates: function (str) {
    var today = new Date();
    var dates = [];
    if (/today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i.exec(str)) dates[0] = today.toDateString();
    if (/(?! after\s*)tomorrow/i.exec(str)) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dates.length == 1) return [today, tomorrow];
      dates[0] = tomorrow.toDateString();
    }

    var dateRegex = /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/ig;
    var match = dateRegex.exec(str)
    if (match) dates.push(match[0]);

    match = dateRegex.exec(str);
    if (match) dates[1] = match[0];

    for (var i = 0; i != dates.length; i++) {
      if (!/\d{4}/.exec(dates[i])) dates[i] = dates[i] + " " + today.getFullYear();
      dates[i] = new Date(dates[i]);
    }
    if (dates.length == 2 && dates[1].getTime() < dates[0].getTime()) {
      var year = dates[1].getFullYear();
      dates[1].setFullYear(++year);
    }

    if (dates.length <= 1) {
      var back = new Date();
      if (dates.length == 1) back = new Date(dates[0]);

      if (/the next day/i.exec(str)) {
        if (!/[A-Z][A-z\-]+\s+the next day/.exec(str)) {
          back.setDate(back.getDate() + 1);
          dates.push(back);
          return dates;
        }
      }
      if (/(in (a|1)|next) week/i.exec(str)) {
        back.setDate(back.getDate() + 7);
        dates.push(back);
        return dates;
      }
      match = /\d(?= week)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 7 * match[0]);
        dates.push(back);
        return dates;
      }
      match = /\d(?= day)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 1 * match[0]);
        dates.push(back);
        return dates;
      }
      match = /\d{1,2}(?=(st|nd|rd|th))/i.exec(str);
      if (match) {
        back.setDate(match[0]);
        if (!dates[0] || back.getTime() < dates[0].getTime()) {
          var month = back.getMonth();
          back.setMonth(++month);
        }
        dates.push(back);
        return dates;
      }
    }

    return dates;
  },


  parseCities: function (str) {
    var cities = this.parseCitiesWorker(str);
    // now remove trailing months ("Hong Kong, August") and commas ("Boston"),
    // but preserve states and countries ("Portland, Maine" and "Odessa, Ukraine")
    for (var c in cities) {
      if (cities[c]) {
        cities[c] = cities[c].replace(/,\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec).*/, "");
        if (',' == cities[c].slice(-1)) cities[c] = cities[c].slice(0, -1);
      }
    }
    return cities;
  },

  parseCitiesWorker: function (str) {
    var fromRegex = /\b([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
    var toRegex = /\b([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
    str = str.replace(/\b[Ss]t. ?/ig, "St ");  // St. Paul, St. Peterburg
    str = str.replace(/\b[Ff]t. ?/ig, "Ft ");  // Ft. Lauderdale
    var from = fromRegex.exec(str);
    var to = toRegex.exec(str);
    var from0, to0;
    if (from) from0 = from[0].replace(/([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)/, "");
    if (to) to0 = to[0].replace(/([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)/, "");
    if (!from && to) {
      var altRegex1 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}\s+to\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex1.exec(str);
      if (match) {
        var cities = match[0].split(" to ");
        return [cities[0], cities[1]];
      }
    }
    if (from && !to) {
      var altRegex2 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,){0,2}\s+from\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex2.exec(str);
      if (match) {
        var cities = match[0].split(" from ");
        return [cities[1], cities[0]];
      }
    }
    if (!from && !to) {
      var comboRegex = /[A-Z][A-z]+-[A-Z][A-z]+/;
      var match = comboRegex.exec(str);
      if (match) {
        var cities = match[0].split("-");
        return [cities[0], cities[1]];
      }
    }
    return [from0, to0];
  },

  // "E":"Economy","P":"Premium","B":"Business","F":"First"
  parseClass: function (text) {
    if (/economy/i.exec(text)) return "E";
    else if (/premium/i.exec(text)) return "P";
    else if (/business/i.exec(text)) return "B";
    else if (/first/i.exec(text)) return "F";
    var match = /\w+\s*(?= class)/i.exec(text);
    if (match) return match[0];
    return null;
  },

  parseNumTix: function (text) {
    if (/\b(ticket|needs|by myself)\b/i.exec(text)) return 1;
    var match = /\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i.exec(text);
    if (match) return match[0].replace(/\s.*/, "");

    if (/s\s+(with|and)\s+(I|myself|me)\b/i.exec(text)) return 3;
    if (/\b(with|and)\s+(I|myself|me)\b/i.exec(text)) return 2;
    if (/\b(with|and)\s+my\s+\w+s\b/i.exec(text)) return 3;
    if (/\b(with|and)\s+(my|a)\b/i.exec(text)) return 2;
    if (/and\s*my\s+\w+s\b/i.exec(text)) return 2;

    if (/\b([Ww]e|are)\s+/.exec(text)) return "multiple";
    if (/\b[Oo]ur\s+/.exec(text)) return "multiple";
    if (/\b(children|students|a group)\s+/i.exec(text)) return "multiple";
    if (/tickets/i.exec(text)) return "multiple";

    if (/[Hh]ow much does it cost/.exec(text)) return 1;

    // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
    if (/\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i.exec(text)) return 1;
    return null;
  },

  /**
   * @description Simple log function to keep the example simple
   */
  log: function () {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }

};