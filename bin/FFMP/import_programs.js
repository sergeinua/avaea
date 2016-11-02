const _REQUEST            = require('request');
const _30K_API_PROGRAMS   = "https://testingapi.30k.com/api/miles/programs";
const _30Klogin = 'avaea';
const _30Kpass = '8ac8c8cae00e';

 var programs = {
  get : function() {
    _REQUEST({
      url:_30K_API_PROGRAMS,
      'auth': {
        'user': _30Klogin,
        'pass': _30Kpass
      }
    }, function( error, response, body ) {
      var jdata = JSON.parse(body);
      var alliance = [
        'Unknown',
        'Independent',
        'OneWorld',
        'SkyTeam',
        'StarAlliance'
      ];
      if (!error && typeof jdata != 'undefined' && jdata.Success ) {
        jdata.Value.forEach(function(program) {
          let sql = "INSERT INTO ffm_programs(" +
            "program_code," +
            "program_name," +
            "help_url," +
            "web_site_url," +
            "signup_url," +
            "alliance," +
            "miles_type_configuration," +
            "tiers_configuration," +
            "airlines) VALUES (" +
            "'" + program.pc + "', " +
            "'" + program.pn + "', " +
            "'" + program.hu + "', " +
            "'" + (program.wu ? program.wu : '') + "', " +
            "'" + program.su + "', '" +
            alliance[program.al] + "', " +
            "'" + JSON.stringify(program.mtc) + "', " +
            "'" + JSON.stringify(program.tc) + "', " +
            "'" + JSON.stringify(program.arl) + "'" +
            ");";
          console.log(sql);
        });
      } else {
        console.log('Request to 30K api is failed!');
        console.log(error,  response, body);
      }
    });
  }
};

programs.get({});