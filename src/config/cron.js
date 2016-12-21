
module.exports.cron = {
  myJob: {
    schedule: '*/5 * * * * *',
    onTick: function () {
      return ReadEticket.execReadEticket();
    },
    // start: true, // Start task immediately
  }
};