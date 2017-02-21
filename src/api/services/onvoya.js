let fs = require('fs');
let util = require('util');

function getCaller(currentStackPosition){
  let fileName = "";
  let rowNumber;
  let columnNumber;
  currentStackPosition = currentStackPosition?currentStackPosition:3; // this is the value representing the position of caller in the error stack.
  let parsed = [];
  let originFunction = Error["prepareStackTrace"];

  try{
    throw new Error("Custom Error");
  } catch(e) {
    Error["prepareStackTrace"] = function() {
      return arguments[1];
    };
    Error.prepareStackTrace(e, function(){});
    fileName     = e.stack[currentStackPosition].getFileName();
    rowNumber    = e.stack[currentStackPosition].getLineNumber();
    columnNumber = e.stack[currentStackPosition].getColumnNumber();
    let re = /(\w+)\/(\w+)\.js$/;
    parsed = fileName.match(re);
    Error["prepareStackTrace"] = originFunction;
  }
  return {
    "file": fileName,
    "row": rowNumber,
    "column": columnNumber,
    "module": parsed ? parsed[2] : 'unknown',
    "type": parsed ? parsed[1] : 'unknown'
  };
};

function getFileLevelConfig(filename, config) {
  let level = sails.config.log.level;

  if (_.isEmpty(config)) {
    return sails.config.log.level;
  }

  if (config[filename.type]) {
    level = config[filename.type].level;
  }

  if (config[filename.type]
    && config[filename.type][filename.module]) {
    level = config[filename.type][filename.module].level;
  }

  return level || sails.config.log.level;
};

//silly, verbose, info, debug, warn, error
let onvoya = {
  userId: 'Unknown User',
  logger: false,
  config: false,
  levels: {
    silent  : 'OFF',
    verbose : 'TRACE',
    info    : 'INFO',
    debug   : 'DEBUG',
    warn    : 'WARN',
    error   : 'ERROR',
    fatal   : 'FATAL',
    crit    : 'FATAL',
    silly   : 'ALL'
  },

  initialize: function(done) {
    let pattern = sails.config.log.timestamp?"%[[%d{ISO8601_WITH_TZ_OFFSET}][%-5p][%x{module}]%] %x{message}":"%[[%-5p] [%x{module}]%] %x{message}";
    // Draft for ONV-673
    // let pattern = sails.config.log.timestamp?"%[[%d{ISO8601}] [%-5p] [%x{user}] [%x{module}]%]\t%m%n":"%[[%-5p] [%x{user}] [%x{module}]%]\t%m%n";
    let config = {
      appenders: [{
        type: "console",
        layout: {
          type    : "pattern",
          pattern : pattern,
          tokens: {
            module : () => {
              const stackTraceLevel = 12;
              let filename = getCaller(stackTraceLevel);
              return filename.type+'/'+filename.module;
            },
            user: () => {
              let userId = _.clone(this.userId);
              return 'UserID: ' + userId;
            },
            message: (mess) => {
              let customMessage = '';
              for (let i = 0; i < mess.data.length; i++) {
                for (let k = 0; k < mess.data[i].length; k++) {
                  customMessage = customMessage + ' ' + (typeof mess.data[i][k] == 'object' ? util.inspect(mess.data[i][k], { showHidden: true, depth: null, maxArrayLength:20, colors:true }):mess.data[i][k]);
                }
              }
              // console.log(mess);
              return customMessage;
            }
          }
        }
      }],
      // replaceConsole: true
    };

    let log4js = require('log4js');
    log4js.configure(config);
    let logger = log4js.getLogger();
    logger.setLevel('ALL');
    onvoya.logger = logger;
    let readConf = () => {
      fs.readFile(process.cwd() + '/config/onvoya-log.json', 'utf8', (err, data) => {
        onvoya.config = (typeof data == 'object') ? data : JSON.parse(data);
        //log level FATAL to make sure it will get to logs
        onvoya.log.crit('Config file was re-read');
      });
    };
    readConf();
    fs.watchFile(process.cwd() + '/config/onvoya-log.json', readConf);
    return done();
  },

  log: {
    log: function(loggerType = "debug", copyArgs) {
      let filename = getCaller();
      let level = getFileLevelConfig(filename, onvoya.config || {});
      onvoya.logger.setLevel(onvoya.levels[level]);
      onvoya.logger[loggerType](copyArgs);
    },

    silly: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("trace", copyArgs);
    },

    verbose: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("trace", copyArgs);
    },

    info: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("info", copyArgs);
    },

    debug: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("debug", copyArgs);
    },

    warn: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("warn", copyArgs);
    },

    error: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("error", copyArgs);
    },

    fatal: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("fatal", copyArgs);
    },

    crit: function() {
      let copyArgs = [].slice.call(arguments);
      this.log("fatal", copyArgs);
    },

    blank: () => {}

  }
};
onvoya.initialize(()=>{});

module.exports = onvoya;
