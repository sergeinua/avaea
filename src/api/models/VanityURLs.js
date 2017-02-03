/**
 * VanityURLs.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
module.exports = {
  tableName: 'vanity_urls',
  attributes: {
    id:               { type: 'integer', primaryKey: true, autoIncrement: true },
    vanity_url:       { type: 'string', unique: true },
    destination_url:  { type: 'string' }
  },
  autoCreatedAt: false,
  autoUpdatedAt: false
};

