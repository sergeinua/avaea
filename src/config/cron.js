
module.exports.cron = {
  readEticket: {
    schedule: '*/55 * * * * *',
    onTick: function () {
      return ReadEticket.execReadEticket();
    },
  }
};