var winston            = require('winston'),
    winstonDailyRotate = require('winston-daily-rotate-file'),
    config             = require('../../config/config'),
    fs                 = require('fs-extra');

/**
 * @param module
 *
 * @description
 * Logger module
 * @return Function
 *
 */

function getLogger(module) {

    var _path   = module.filename.split('/').slice(-2).join('/');
    fs.ensureDir(config.get('logsDirectory'));

    return new (winston.Logger)({
        transports: [
            new winston.transports.Console({
                colorize : true,
                label    : _path
            }),
            new winstonDailyRotate({
                colorize    : true,
                filename    : config.get('appLogName'),
                dirname     : config.get('logsDirectory'),
                datePattern : config.get('logDatePattern')
            })
        ]
    });

};

module.exports = getLogger;