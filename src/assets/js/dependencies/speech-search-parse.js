var speechSearchParse = {
  meriParseResult: {
    origin_airport: {
      value: '',
      matched: ''
    },
    destination_airport: {
      value: '',
      matched: ''
    },
    class_of_service: {
      value: '',
      matched: ''
    },
    origin_date: {
      value: '',
      matched: ''
    },
    return_date: {
      value: '',
      matched: ''
    },
    number_of_tickets: {
      value: '',
      matched: ''
    },
    type: {
      value: '',
      matched: ''
    },
    not_parsed: ''
  },

  saveState: function (value_name, value, regex) {
    this.meriParseResult[value_name].value = value;
    if (regex) {
      this.meriParseResult[value_name].matched = regex.exec(this.meriParseResult.not_parsed)[0];
      this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(regex, '');
    }
  },

  parseDates: function (str) {
    var today = new Date();
    var dates = [];
    if (/today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i.exec(str)) {
      dates[0] = today.toDateString();
      this.saveState('origin_date', dates[0], /today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i);
    }
    if (/(?! after\s*)tomorrow/i.exec(str)) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dates.length == 1) {
        this.saveState('return_date', tomorrow, /(?! after\s*)tomorrow/i);
        return [today, tomorrow];
      }
      dates[0] = tomorrow.toDateString();
      this.saveState('origin_date', dates[0], /(?! after\s*)tomorrow/i);
    }

    var dateRegex = /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/ig;
    var match = dateRegex.exec(str);
    if (match) {
      dates.push(match[0]);
      this.saveState('origin_date', match[0], /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/i);
    }

    match = dateRegex.exec(str);
    if (match) {
      dates[1] = match[0];
      this.saveState('return_date', dates[1], /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/i);
    }

    for (var i = 0; i != dates.length; i++) {
      if (!/\d{4}/.exec(dates[i])) dates[i] = dates[i] + " " + today.getFullYear();
      dates[i] = new Date(dates[i]);
      if (i == 0) {
        this.saveState('origin_date', dates[i]);
      } else {
        this.saveState('return_date', dates[i]);
      }
    }
    if (dates.length == 2 && dates[1].getTime() < dates[0].getTime()) {
      var year = dates[1].getFullYear();
      dates[1].setFullYear(++year);
      this.saveState('return_date', dates[i]);
    }

    if (dates.length <= 1) {
      var back = new Date();
      if (dates.length == 1) {
        back = new Date(dates[0]);
        this.saveState('return_date', back);
      }

      if (/the next day/i.exec(str)) {
        if (!/[A-Z][A-z\-]+\s+the next day/.exec(str)) {
          back.setDate(back.getDate() + 1);
          dates.push(back);
          this.saveState('return_date', back, dateRegex);
          return dates;
        }
      }
      if (/(in (a|1)|next) week/i.exec(str)) {
        back.setDate(back.getDate() + 7);
        dates.push(back);
        this.saveState('return_date', back, /(in (a|1)|next) week/i);
        return dates;
      }
      match = /\d(?= week)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 7 * match[0]);
        dates.push(back);
        this.saveState('return_date', back, /\d(?= week)/i);
        return dates;
      }
      match = /\d(?= day)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 1 * match[0]);
        dates.push(back);
        this.saveState('return_date', back, /\d(?= day)/i);
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
        this.saveState('return_date', back, /\d{1,2}(?=(st|nd|rd|th))/i);
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
        if (',' == cities[c].slice(-1)) {
          cities[c] = cities[c].slice(0, -1);
        }
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
    this.saveState('origin_airport', from, fromRegex);
    var to = toRegex.exec(str);
    this.saveState('destination_airport', to, toRegex);
    var from0, to0;
    if (from) {
      from0 = from[0].replace(/([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)/, "");
      this.saveState('origin_airport', from0);
    }
    if (to) {
      to0 = to[0].replace(/([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)/, "");
      this.saveState('destination_airport', to0);
    }
    if (!from && to) {
      var altRegex1 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}\s+to\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex1.exec(str);
      if (match) {
        var cities = match[0].split(" to ");

        this.saveState('origin_airport', cities[0], altRegex1);
        this.saveState('destination_airport', cities[1], altRegex1);

        return [cities[0], cities[1]];
      }
    }
    if (from && !to) {
      var altRegex2 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,){0,2}\s+from\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex2.exec(str);
      if (match) {
        var cities = match[0].split(" from ");

        this.saveState('origin_airport', cities[1], altRegex2);
        this.saveState('destination_airport', cities[0], altRegex2);

        return [cities[1], cities[0]];
      }
    }
    if (!from && !to) {
      var comboRegex = /[A-Z][A-z]+-[A-Z][A-z]+/;
      var match = comboRegex.exec(str);
      if (match) {
        var cities = match[0].split("-");

        this.saveState('origin_airport', cities[0], comboRegex);
        this.saveState('destination_airport', cities[1], comboRegex);

        return [cities[0], cities[1]];
      }
    }
    return [from0, to0];
  },

  // "E":"Economy","P":"Premium","B":"Business","F":"First"
  parseClass: function (text) {
    if (/economy/i.exec(text)) {
      this.saveState('class_of_service', "E", /economy/i);
      return "E";
    } else if (/premium/i.exec(text)) {
      this.saveState('class_of_service', "P", /premium/i);
      return "P";
    } else if (/business/i.exec(text)) {
      this.saveState('class_of_service', "B", /business/i);
      return "B";
    } else if (/first/i.exec(text)) {
      this.saveState('class_of_service', "F", /first/i);
      return "F";
    }
    var match = /\w+\s*(?= class)/i.exec(text);
    if (match) {
      this.saveState('class_of_service', match[0], /\w+\s*(?= class)/i);
      return match[0];
    }
    return null;
  },

  parseNumTickets: function (text) {
    if (/\b(ticket|needs|by myself)\b/i.exec(text)) {
      this.saveState('number_of_tickets', 1, /\b(ticket|needs|by myself)\b/i);
      return 1;
    }
    var match = /\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i.exec(text);
    if (match) {
      this.saveState('number_of_tickets', match[0].replace(/\s.*/, /\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i));
      return match[0].replace(/\s.*/, "");
    }

    if (/s\s+(with|and)\s+(I|myself|me)\b/i.exec(text)) {
      this.saveState('number_of_tickets', 3, /s\s+(with|and)\s+(I|myself|me)\b/i);
      return 3;
    }
    if (/\b(with|and)\s+(I|myself|me)\b/i.exec(text)) {
      this.saveState('number_of_tickets', 2, /\b(with|and)\s+(I|myself|me)\b/i);
      return 2;
    }
    if (/\b(with|and)\s+my\s+\w+s\b/i.exec(text)) {
      this.saveState('number_of_tickets', 3, /\b(with|and)\s+my\s+\w+s\b/i);
      return 3;
    }
    if (/\b(with|and)\s+(my|a)\b/i.exec(text)) {
      this.saveState('number_of_tickets', 2, /\b(with|and)\s+(my|a)\b/i);
      return 2;
    }
    if (/and\s*my\s+\w+s\b/i.exec(text)) {
      this.saveState('number_of_tickets', 2, /and\s*my\s+\w+s\b/i);
      return 2;
    }

    if (/\b([Ww]e|are)\s+/.exec(text)) {
      this.saveState('number_of_tickets', 'multiple', /\b([Ww]e|are)\s+/i);
      return "multiple";
    }
    if (/\b[Oo]ur\s+/.exec(text)) {
      this.saveState('number_of_tickets', 'multiple', /\b[Oo]ur\s+/);
      return "multiple";
    }
    if (/\b(children|students|a group)\s+/i.exec(text)) {
      this.saveState('number_of_tickets', 'multiple', /\b(children|students|a group)\s+/i);
      return "multiple";
    }
    if (/tickets/i.exec(text)) {
      this.saveState('number_of_tickets', 'multiple', /tickets/i);
      return "multiple";
    }

    if (/[Hh]ow much does it cost/.exec(text)) {
      this.saveState('number_of_tickets', 1, /[Hh]ow much does it cost/);
      return 1;
    }

    // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
    if (/\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i.exec(text)) {
      this.saveState('number_of_tickets', 1, /\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i);
      return 1;
    }
    return null;
  },

  run: function (text) {
    text = $.trim(text);
    text = text.replace(/\bone|fir(?= st)/ig, "1");
    text = text.replace(/\btwo|seco(?= nd)/ig, "2");
    text = text.replace(/\bthree|thi(?= rd)/ig, "3");
    text = text.replace(/\bfour/ig, "4");
    text = text.replace(/\bfive/ig, "5");
    text = text.replace(/\bsix/ig, "6");
    this.meriParseResult.not_parsed = text;

    this.parseDates(this.meriParseResult.not_parsed);
    if (this.meriParseResult.return_date.value) {
      this.saveState('type', 'round_trip');
    } else {
      this.saveState('type', 'one_way');
    }

    this.parseCities(this.meriParseResult.not_parsed);

    this.parseNumTickets(this.meriParseResult.not_parsed);

    this.parseClass(this.meriParseResult.not_parsed);

    this.log(this.meriParseResult);
    return this.meriParseResult;
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
