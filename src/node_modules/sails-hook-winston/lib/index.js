'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (sails) {
  return {
    ready: false,

    initialize: function initialize(done) {
      var log = void 0;
      var logger = void 0;
      var captainsOptions = sails.config.log;
      var consoleOptions = {
        level: sails.config.log.level,
        formatter: function formatter(options) {
          var message = '';

          if (sails.config.log.timestamp) {
            message = sails.config.log.timestampFormat ? (0, _moment2.default)().format(sails.config.log.timestampFormat) : (0, _moment2.default)().format('LLLL');
            message += ' ';
          }

          message += options.message || '';
          message += options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '';
          return message;
        }
      };

      // Console Transport
      logger = new _winston2.default.Logger({
        transports: [new _winston2.default.transports.Console(consoleOptions)],
        levels: {
          error: 1,
          warn: 2,
          debug: 3,
          info: 4,
          verbose: 5,
          silly: 6
        }
      });

      // Custom Transport
      // More information: https://github.com/winstonjs/winston/blob/master/docs/transports.md
      if (Object.prototype.toString.call(sails.config.log.transports) === '[object Array]' && sails.config.log.transports.length > 0) {
        sails.config.log.transports.forEach(function (transport) {
          return logger.add(transport.module, transport.config || {});
        });
      }

      sails.config.log.custom = logger;
      captainsOptions.custom = logger;

      log = (0, _captainsLog2.default)(captainsOptions);
      log.ship = (0, _ship2.default)(sails.version ? 'v' + sails.version : '', log.info);
      sails.log = log;

      return done();
    }
  };
};

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _captainsLog = require('captains-log');

var _captainsLog2 = _interopRequireDefault(_captainsLog);

var _ship = require('sails/lib/hooks/logger/ship');

var _ship2 = _interopRequireDefault(_ship);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];