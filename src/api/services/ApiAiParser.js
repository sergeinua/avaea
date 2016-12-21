import moment from 'moment';

const parserKeys = [
  'origin_date',
  'return_date',
  'origin_airport',
  'return_airport',
  'class_of_service',
  'type',
  'number_of_tickets'
];

const parser = new require('./AvaeaTextParser.js');

export default class ApiAiParser {
  getParserKeys(){
    return parserKeys;
  }
  correctData(data) {
    const correctClass = (c) => {
      if (!c) return 'E';
      var translated = {
        'first-class': 'F',
        'first class': 'F',
        'business class': "B",
        'economy': 'E'
      }[c];
      return translated || c.toUpperCase();
    };
    const correctTickets = (t) => {
      if (!t) return 1;
      return t;
    };
    const correctDate = (d) => {
      if (!d) return '';
      if(d == 'ERROR') return d;
      if(!moment(d).isValid()) return '';
      return moment(d).format('YYYY-MM-DD');
    };
    const correctType = (t) => {
      if(t == 'round_trip')return "round_trip";
      if ((!t && !data.return_date) || t == 'one' || t == 'one_way') return 'one_way';
      if(data.return_date == 'none'){
        // console.log(">>!>> one_way");
        return 'one_way';
      }
      return 'round_trip';
    };
    const removeNulls = (obj) => {
      for (var v in obj) {
        if (obj[v] == undefined) {
          obj[v] = '';
        }
      }
      return obj;
    };
    return {
      ...removeNulls(data),
      origin_date: correctDate(data.origin_date),
      return_date: correctDate(data.return_date),
      class_of_service: correctClass(data.class_of_service),
      type: correctType(data.type),
      number_of_tickets: correctTickets(data.number_of_tickets)
    };
  }
  convertApiAiData(data) {
    var result = {};
    result.source_json = data;
    if (data.status.code == 200) {
      const parameters = data.result.contexts[0].parameters;
      parserKeys.forEach(e => {
        result[e] = parameters[e];
      });
      const nullSafe = (...path) => {
        var obj = parameters;
        for (var v of path) {
          if (obj[v] == undefined) return '';
          obj = obj[v];
        }
        return obj ? obj : '';
      };
      const parseDate = (dateString) => {
        parser.run(dateString);
        return {
          origin_date: this.getParserDataByKey('origin_date'),
          return_date: this.getParserDataByKey('return_date')
        };
      };

      result.origin_airport =
        nullSafe('origin_airport.original') ||
        (nullSafe('origin_city.original') + ' ' + nullSafe('origin-airport-name.original') + ' ' +
         nullSafe('origin_state_us.original') + ' ' +
         nullSafe('origin_country.original'))
        .trim()
        .replace(/\s+/g, ' ');

      result.return_airport =
        nullSafe('destination_airport.original') ||
        (nullSafe('destination_city.original') + ' ' + nullSafe('destination-airport-name.original') + ' ' +
         nullSafe('destination_state_us.original') + ' ' +
         nullSafe('destination_country.original'))
        .trim()
        .replace(/\s+/g, ' ');

      let departStr = (nullSafe('origin_date.original') || nullSafe('origin_date_period.original') ||
                    nullSafe('origin_time_special.original'));
      let returnStr = (nullSafe('return_date.original') || nullSafe('return_date_period.original'));
      let durationStr = nullSafe('trip_duration.original');

      console.log(">>!", {departStr, returnStr, durationStr});

      let dateString = "";
      // let hasReturn = returnStr || durationStr;
      let hasReturn = true;

      if(hasReturn){
        dateString = ('Depart ' + departStr + ' and return ' + returnStr || ('after ' + durationStr + ' trip'));
      }else{
        dateString = departStr;
      }

      let {origin_date, return_date} = parseDate(dateString);

      result.origin_date = origin_date;
      result.return_date = return_date;
      if(!hasReturn)result.return_date = '';

      result.class_of_service = nullSafe('ticket_class', 0);
      result.type = nullSafe('round_trip', 0);
      return this.correctData(result);
    } else {
      return result;
    }
  }
  async parse(text, sessionId) {
    const accessToken = '6fe9c8eda7644993ab56ff8b5fa1b33a';
    const url = 'https://api.api.ai/v1/query?v=20150910';
    try {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          query: text,
          lang: "en",
          sessionId: sessionId
        })
      });
      let responseJson = await response.json();
      return this.convertApiAiData(responseJson);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  getParserDataByKey(key) {
    if (parser[key] && parser[key].value) {
      const value = (typeof(parser[key].value.toDateString) == "function") ?
            parser[key].value.toDateString() : parser[key].value;
      return value || '';
    }
    return '';
  }
  regexpParse(text) {
    const result = {};
    let notParsed = parser.run(text);
    parserKeys.forEach(key => {
      result[key] = this.getParserDataByKey(key);
    });
    result.type = result.return_date ? 'round_trip' : 'one_way';
    result.source_json = {...result
                         };
    return this.correctData(result);
  }
}
