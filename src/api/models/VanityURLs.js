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
    destination_url:  { type: 'string' },
    creationDate: {
        columnName: 'created_at',
        type: 'datetime',
        defaultsTo: function() {return new Date();}
    },
    updateDate: {
        columnName: 'updated_at',
        type: 'datetime',
        defaultsTo: function() {return new Date();}
    }
  },
  beforeUpdate:function(values,next) {
      values.updateDate = new Date();
      next();
  },
  autoCreatedAt: 'created_at',
  autoUpdatedAt: 'updated_at'
};

