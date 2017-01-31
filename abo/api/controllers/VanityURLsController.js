/**
 * VanityURLsController
 *
 * @description :: Server-side logic for managing Vanityurls
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let utils = require('../services/utils');
let VanityURLsService = require('../services/VanityURLsService');

module.exports = {  
  create: function(req, res){
    let vanityURL = req.body.vanity_url;
    let destinationURL = req.body.destination_url;
    
    if(!utils.isValidURL(vanityURL)){
      return res.json({error: 'Vanity URL is not valid'});
    }          
    if(!utils.isValidURL(destinationURL)){
      return res.json({error: 'Destination URL is not valid'});
    }
    
    VanityURLs.create({vanity_url: vanityURL, destination_url: destinationURL}).exec((err, result)=>{
      if(err){
        sails.log.warn('VanityURLsController.create %s', err);
        return res.json({error: err});          
      }else{
        // update cache
        VanityURLsService.updateCache();
        return res.json({data: result, error: ''});
      }
    }); 
  },

  read: function(req, res){
    var criteria = {};
    
    if(req.params.id){
      criteria.id = req.params.id;
    }
    
    VanityURLs.find(criteria).exec((err, result)=>{
      if(err){
        sails.log.warn('VanityURLsController.read %s', err);
        return res.json({error: err});
      }else{
        // update cache
        VanityURLsService.updateCache();
        return res.json({data: result, error: ''});
      }
    });     
  },  
  
  edit: function(req, res){
    if(!req.params.id){
      return res.json({error: 'Id is empty'});
    }
    
    let vanityURL = req.body.vanity_url;
    let destinationURL = req.body.destination_url;
      
    if(!utils.isValidURL(vanityURL)){
      return res.json({error: 'Vanity URL is not valid'});
    }          
    if(!utils.isValidURL(destinationURL)){
      return res.json({error: 'Destination URL is not valid'});
    }    
    
    VanityURLs.update({id: req.params.id}, {vanity_url: vanityURL, destination_url: destinationURL}).exec((err, result)=>{
      sails.log(result);
        if(err){
          sails.log.warn('VanityURLsController.edit %s', err);
          return res.json({error: err});
        }else{
          VanityURLsService.updateCache();
          return res.json({data: result, error: ''});
        }
    });     
  },
  
  delete: function(req, res){
    if(!req.params.id){
      return res.json({error: ''});
    }
    
    VanityURLs.destroy({id: req.params.id}).exec((err)=>{
        if(err){
          sails.log.warn('VanityURLsController.delete %s', err);
          return res.json({error: err});
        }else{
          VanityURLsService.updateCache();
          return res.json({error: ''});
        }
    });     
  }
};

