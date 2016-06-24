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

  parseDates: function(str) {
    var today = new Date();
    var dates = [];
    if (/today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i.exec(str)) {
      dates[0] = today.toDateString();
      this.meriParseResult.origin_date.value = dates[0];
      this.meriParseResult.origin_date.matched = /today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i.exec(str)[0];
      this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/today|(depart|leav|fly)\w+\s+now|earliest|soon|quickly/i, '');
    }
    if (/(?! after\s*)tomorrow/i.exec(str)) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dates.length == 1) {
        this.meriParseResult.return_date.value = tomorrow;
        this.meriParseResult.return_date.matched = /(?! after\s*)tomorrow/i.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/(?! after\s*)tomorrow/i, '');
        return [today, tomorrow];
      }
      dates[0] = tomorrow.toDateString();
      this.meriParseResult.origin_date.value = dates[0];
      this.meriParseResult.origin_date.matched = /(?! after\s*)tomorrow/i.exec(str)[0];
      this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/(?! after\s*)tomorrow/i, '');
    }

    var dateRegex = /(\d{1,2}\s+)?\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t)?(ember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b(\s+\d{1,2})?(,?\s*\d{4})?/ig;
    var match = dateRegex.exec(str);
    if (match) {
      dates.push(match[0]);
      this.meriParseResult.origin_date.value = dates[0];
      this.meriParseResult.origin_date.matched = match[0];
      this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(dateRegex, '');
    }

    match = dateRegex.exec(str);
    if (match) {
      dates[1] = match[0];
      this.meriParseResult.return_date.value = dates[1];
      this.meriParseResult.return_date.matched = match[0];
      this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(dateRegex, '');
    }

    for (var i = 0; i != dates.length; i++) {
      if (!/\d{4}/.exec(dates[i])) dates[i] = dates[i] + " " + today.getFullYear();
      dates[i] = new Date(dates[i]);
      if (i == 0) {
        this.meriParseResult.origin_date.value = dates[i];
      } else {
        this.meriParseResult.return_date.value = dates[i];
      }
    }
    if (dates.length == 2 && dates[1].getTime() < dates[0].getTime()) {
      var year = dates[1].getFullYear();
      dates[1].setFullYear(++year);
      this.meriParseResult.return_date.value = dates[1];
    }

    if (dates.length <= 1) {
      var back = new Date();
      if (dates.length == 1) {
        back = new Date(dates[0]);
        this.meriParseResult.return_date.value = back;
      }

      if (/the next day/i.exec(str)) {
        if (!/[A-Z][A-z\-]+\s+the next day/.exec(str)) {
          back.setDate(back.getDate() + 1);
          dates.push(back);
          this.meriParseResult.return_date.value = back;
          this.meriParseResult.return_date.matched = dateRegex.exec(str)[0];
          this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(dateRegex, '');
          return dates;
        }
      }
      if (/(in (a|1)|next) week/i.exec(str)) {
        back.setDate(back.getDate() + 7);
        dates.push(back);
        this.meriParseResult.return_date.value = back;
        this.meriParseResult.return_date.matched = /(in (a|1)|next) week/i.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/(in (a|1)|next) week/i, '');
        return dates;
      }
      match = /\d(?= week)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 7 * match[0]);
        dates.push(back);
        this.meriParseResult.return_date.value = back;
        this.meriParseResult.return_date.matched = /\d(?= week)/i.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/\d(?= week)/i, '');
        return dates;
      }
      match = /\d(?= day)/i.exec(str);
      if (match) {
        back.setDate(back.getDate() + 1 * match[0]);
        dates.push(back);
        this.meriParseResult.return_date.value = back;
        this.meriParseResult.return_date.matched = /\d(?= day)/i.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/\d(?= day)/i, '');
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
        this.meriParseResult.return_date.value = back;
        this.meriParseResult.return_date.matched = /\d{1,2}(?=(st|nd|rd|th))/i.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(/\d{1,2}(?=(st|nd|rd|th))/i, '');
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
    this.meriParseResult.origin_airport.value = from;
    this.meriParseResult.origin_airport.matched = fromRegex.exec(str)[0];
    this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(fromRegex, '');
    var to = toRegex.exec(str);
    this.meriParseResult.destination_airport.value = to;
    this.meriParseResult.destination_airport.matched = toRegex.exec(str)[0];
    this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(toRegex, '');
    var from0, to0;
    if (from) {
      from0 = from[0].replace(/([Ff]rom|[Dd]epart\w*|(am|is|are)\s+\w+\s+in)/, "");
      this.meriParseResult.origin_airport.value = from0;
    }
    if (to) {
      to0 = to[0].replace(/([Tt]o|[Aa]t|[Rr]each\w*|[Aa]rriv\w*)/, "");
      this.meriParseResult.destination_airport.value = to0;
    }
    if (!from && to) {
      var altRegex1 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}\s+to\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex1.exec(str);
      if (match) {
        var cities = match[0].split(" to ");

        this.meriParseResult.origin_airport.value = cities[0];
        this.meriParseResult.origin_airport.matched = altRegex1.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(altRegex1, '');

        this.meriParseResult.destination_airport.value = cities[1];
        this.meriParseResult.destination_airport.matched = altRegex1.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(altRegex1, '');

        return [cities[0], cities[1]];
      }
    }
    if (from && !to) {
      var altRegex2 = /[A-Z][A-z\-,]+(\s+[A-Z]\w+,){0,2}\s+from\s+[A-Z][A-z\-,]+(\s+[A-Z]\w+,?){0,2}/;
      var match = altRegex2.exec(str);
      if (match) {
        var cities = match[0].split(" from ");

        this.meriParseResult.origin_airport.value = cities[1];
        this.meriParseResult.origin_airport.matched = altRegex2.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(altRegex2, '');

        this.meriParseResult.destination_airport.value = cities[0];
        this.meriParseResult.destination_airport.matched = altRegex2.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(altRegex2, '');

        return [cities[1], cities[0]];
      }
    }
    if (!from && !to) {
      var comboRegex = /[A-Z][A-z]+-[A-Z][A-z]+/;
      var match = comboRegex.exec(str);
      if (match) {
        var cities = match[0].split("-");

        this.meriParseResult.origin_airport.value = cities[0];
        this.meriParseResult.origin_airport.matched = comboRegex.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(comboRegex, '');

        this.meriParseResult.destination_airport.value = cities[1];
        this.meriParseResult.destination_airport.matched = comboRegex.exec(str)[0];
        this.meriParseResult.not_parsed = this.meriParseResult.not_parsed.replace(comboRegex, '');

        return [cities[0], cities[1]];
      }
    }
    return [from0, to0];
  },

  // "E":"Economy","P":"Premium","B":"Business","F":"First"
  parseClass: function (text) {
    if (/economy/i.exec(text)) {
      this.meriParseResult.class_of_service.value = "E";
      this.meriParseResult.class_of_service.matched = 'economy';
      this.meriParseResult.not_parsed = text.replace(/economy/i, '');
      return "E";
    } else if (/premium/i.exec(text)) {
      this.meriParseResult.class_of_service.value = "P";
      this.meriParseResult.class_of_service.matched = 'premium';
      this.meriParseResult.not_parsed = text.replace(/premium/i, '');
      return "P";
    } else if (/business/i.exec(text)) {
      this.meriParseResult.class_of_service.value = "B";
      this.meriParseResult.class_of_service.matched = 'business';
      this.meriParseResult.not_parsed = text.replace(/business/i, '');
      return "B";
    } else if (/first/i.exec(text)) {
      this.meriParseResult.class_of_service.value = "F";
      this.meriParseResult.class_of_service.matched = 'first';
      this.meriParseResult.not_parsed = text.replace(/first/i, '');
      return "F";
    }
    var match = /\w+\s*(?= class)/i.exec(text);
    if (match) {
      this.meriParseResult.class_of_service.value = match[0];
      this.meriParseResult.class_of_service.matched = /\w+\s*(?= class)/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\w+\s*(?= class)/i, '');
      return match[0];
    }
    return null;
  },

  parseNumTickets: function (text) {
    if (/\b(ticket|needs|by myself)\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 1;
      this.meriParseResult.number_of_tickets.matched = /\b(ticket|needs|by myself)\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b(ticket|needs|by myself)\b/i, '');
      return 1;
    }
    var match = /\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i.exec(text);
    if (match) {
      this.meriParseResult.number_of_tickets.value = match[0].replace(/\s.*/, "");
      this.meriParseResult.number_of_tickets.matched = match[0];
      this.meriParseResult.not_parsed = text.replace(/\d+(\s+[a-z\-]+)?(\s+[a-z\-]+)?\s+ticket/i, '');
      return match[0].replace(/\s.*/, "");
    }

    if (/s\s+(with|and)\s+(I|myself|me)\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 3;
      this.meriParseResult.number_of_tickets.matched = /s\s+(with|and)\s+(I|myself|me)\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/s\s+(with|and)\s+(I|myself|me)\b/i, '');
      return 3;
    }
    if (/\b(with|and)\s+(I|myself|me)\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 2;
      this.meriParseResult.number_of_tickets.matched = /\b(with|and)\s+(I|myself|me)\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b(with|and)\s+(I|myself|me)\b/i, '');
      return 2;
    }
    if (/\b(with|and)\s+my\s+\w+s\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 3;
      this.meriParseResult.number_of_tickets.matched = /\b(with|and)\s+my\s+\w+s\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b(with|and)\s+my\s+\w+s\b/i, '');
      return 3;
    }
    if (/\b(with|and)\s+(my|a)\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 2;
      this.meriParseResult.number_of_tickets.matched = /\b(with|and)\s+(my|a)\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b(with|and)\s+(my|a)\b/i, '');
      return 2;
    }
    if (/and\s*my\s+\w+s\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 2;
      this.meriParseResult.number_of_tickets.matched = /and\s*my\s+\w+s\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/and\s*my\s+\w+s\b/i, '');
      return 2;
    }

    if (/\b([Ww]e|are)\s+/.exec(text)) {
      this.meriParseResult.number_of_tickets.value = "multiple";
      this.meriParseResult.number_of_tickets.matched = /\b([Ww]e|are)\s+/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b([Ww]e|are)\s+/i, '');
      return "multiple";
    }
    if (/\b[Oo]ur\s+/.exec(text)) {
      this.meriParseResult.number_of_tickets.value = "multiple";
      this.meriParseResult.number_of_tickets.matched = /\b[Oo]ur\s+/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b[Oo]ur\s+/i, '');
      return "multiple";
    }
    if (/\b(children|students|a group)\s+/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = "multiple";
      this.meriParseResult.number_of_tickets.matched = /\b(children|students|a group)\s+/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\b(children|students|a group)\s+/i, '');
      return "multiple";
    }
    if (/tickets/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = "multiple";
      this.meriParseResult.number_of_tickets.matched = /tickets/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/tickets/i, '');
      return "multiple";
    }

    if (/[Hh]ow much does it cost/.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 1;
      this.meriParseResult.number_of_tickets.matched = /[Hh]ow much does it cost/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/[Hh]ow much does it cost/i, '');
      return 1;
    }

    // This test is unreliable, so we try to catch constructs like "I am flying with my parents are" earlier
    if (/\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i.exec(text)) {
      this.meriParseResult.number_of_tickets.value = 1;
      this.meriParseResult.number_of_tickets.matched = /\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i.exec(text)[0];
      this.meriParseResult.not_parsed = text.replace(/\bI\s+(need\s+to\s+)?(am|be|get|fly|reach|arrive|land)\b/i, '');
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
      this.meriParseResult.type.value = 'round_trip';
    } else {
      this.meriParseResult.type.value = 'one_way';
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
