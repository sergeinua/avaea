/**
 * VanityURLs.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var qpromice = require('q');

module.exports = {
  tableName: 'vanity_urls',
  attributes: {
    id:               { type: 'integer', primaryKey: true, unique: true, required: true },
    vanity_url:       { type: 'string', defaultsTo: '', unique: true },
    destination_url:  { type: 'string', defaultsTo: '', },
    state:            { type: 'string', enum: ['active', 'pending'], defaultsTo: 'active' },
    referrers:        { type: 'integer', defaultsTo: 0 }
  },
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  findByCriteria: function (criteria) {
    var qdefer = qpromice.defer();

    this.find(criteria).exec(function (err, records) {
      if (err) {
        sails.log.error(err);
        qdefer.reject(err);
      } else {
        qdefer.resolve(records);
      }
    });

    return qdefer.promise;
  },
  

};

