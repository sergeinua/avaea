let fs = require('fs');

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
    let pattern = sails.config.log.timestamp?"%[[%d{ISO8601}] [%-5p] [%x{module}]%]\t%m%n":"%[[%-5p] [%x{module}]%]\t%m%n";
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
    setInterval(() => {
      fs.readFile(process.cwd() + '/config/onvoya-log.json', 'utf8', (err, data) => {
        onvoya.config = (typeof data == 'object') ? data : JSON.parse(data);
        sails.log.verbose('Config file was re-read');
      });
    }, sails.config.log.refreshConfig || 30000);
    return done();
  },

  log: {
    log: function(loggerType = "debug", copyArgs) {
      let filename = getCaller();
      let level = getFileLevelConfig(filename, onvoya.config || {});
      onvoya.logger.setLevel(onvoya.levels[level]);
      copyArgs.map((item) => {
        return JSON.stringify(item);
      });
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
