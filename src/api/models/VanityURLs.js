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
    id:               { type: 'integer', primaryKey: true, autoIncrement: true },
    vanity_url:       { type: 'string', unique: true },
    destination_url:  { type: 'string' },
    referrers:        { type: 'integer', defaultsTo: 0 }
  },
  autoCreatedAt: false,
  autoUpdatedAt: false,
  
  addReferrer: function(vanityURL){
    var qdefer = qpromice.defer();  
    
    vanityURL = (''+vanityURL).trim();    
    VanityURLs.findOne({vanity_url: vanityURL}).exec((err, row)=>{
        if(err) {
          sails.log.warn('VanityURLs.addReferrer warning: %s', err);
          qdefer.reject(err);
        }
        
        if(!row) {
          let s = 'Could not find Vanity URL '+vanityURL;
          sails.log.warn('VanityURLs.addReferrer warning: %s', s);
          qdefer.reject(s);         
        }
        
        row.referres += 1;
        row.save(function(err, row) { 
          if(err) {
            sails.log.warn('VanityURLs.addReferrer warning: %s', err);
            qdefer.reject(err);
          }else{
            qdefer.resolve(row);
          }          
        });                
      });
      
    return qdefer.promise;
  }

};

