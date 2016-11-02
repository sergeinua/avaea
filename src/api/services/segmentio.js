var Analytics = require('analytics-node');
//todo remove { flushAt: 1 } param after tests
//https://segment.com/docs/sources/server/node/#development
var analytics = new Analytics(sails.config.segmentio_key, { flushAt: 1 });

module.exports = {

  // https://segment.com/docs/sources/server/node/#identify
  identify: function (userId, traits) {
    analytics.identify({
      userId: userId,
      traits: traits
    });
  },

  track: function (userId, event, properties, anonymousId) {
    analytics.track({
      userId: userId,
      event: event,
      properties: properties,
      anonymousId: anonymousId
    });
  }

};
