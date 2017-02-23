/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
let qpromise = require('q');

let vanityURLsCacheKey = 'VanityURLs'; // this is the key for cache store

module.exports = {
  updateCache: function(){ // using by cron for updating mem store of vanity urls
    VanityURLs.find().exec((err, result)=>{
      if (err) {
        onvoya.log.error(err);
      }
      if (typeof result === 'undefined') {
        result = [];
      }
      // store data in cache
      cache.store(vanityURLsCacheKey, result);
      onvoya.log.silly('vanity URLs loaded to the cache');
    });
  },

  loadCache: function(){ // load data from cache return promise object
    var deferred = qpromise.defer();

    cache.get(vanityURLsCacheKey, (err, result)=>{
      if (err) {
        onvoya.log.error(err);
        deferred.reject(err);
      } else {
        deferred.resolve(JSON.parse(result));
      }
    });

    return deferred.promise;
  }
};
