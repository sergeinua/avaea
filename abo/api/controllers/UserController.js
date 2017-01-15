/* global User */
/* global Profile */
/* global sails */
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var qpromise = require('q');

module.exports = {

  /**
   * `UserController.login()`
   */
  create: function (req, res) {
    var self = this;
    return res.view('user/create', {
      selectedAirline: self._setAirlineCode(req),
      title:'Create profile',
      selectedUser: req.params.user_id,
      user: req.user
    });
  },

  /**
   * `UserController.profile()`
   */
  profile: function (req, res) {
    var selectedAirline = this._setAirlineCode(req);


    var data = {user_id: req.params.user_id, profile: {}, airlines: undefined, ffmprograms: undefined};  
    
    var getUserProfile = function(data){
      var deferred = qpromise.defer();
      Profile.findOneByUserId(data.user_id).exec(function findOneCB(error, result) {
          if (error) {
            deferred.reject(error);
          }else{
            data.profile = result;
            deferred.resolve(data);
          }
      });
      return deferred.promise;      
    };    
    
    var getAirlines = function(data){
      var deferred = qpromise.defer();
      Airlines.find().exec(function (error, result){
          if(error){
              deferred.reject(error);
          }else{
              data.airlines = result;
              deferred.resolve(data);
          }
      });      
      return deferred.promise;
    };
    
    var getFFMPrograms = function(data){    
      var deferred = qpromise.defer();
      FFMPrograms.find().exec(function (error, result){
          if(error){
              deferred.reject(error);
          }else{
              data.ffmprograms = result;
              deferred.resolve(data);
          }
      });
      return deferred.promise;
    };   

    return getUserProfile(data) // get user profile
      .then(getAirlines)        // get list of airlines
      .then(getFFMPrograms)     // get ffm programs
      .then(function(data){     // return response for view
        if(typeof data.profile === 'undefined'){
          res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/create/' + data.user_id);                
        }
        
        data.airlines = (typeof data.airlines === 'undefined')? []: data.airlines;
        data.ffmprograms = (typeof data.ffmprograms === 'undefined')? []: data.ffmprograms;
        
        var profile = data.profile; // user profile
        var profile_fields = {};

        for(var prop in profile) {
          if(!profile.hasOwnProperty(prop)){
            continue;
          }
          if(typeof profile[prop] === 'undefined' || profile[prop] === null){
            profile_fields[prop] = ''
          }else if(typeof profile[prop] === 'object' || profile[prop] === 'array'){
            profile_fields[prop] = profile[prop];
          }else{
            profile_fields[prop] = ('' + profile[prop]).trim();
          }
        }

        if (typeof profile_fields.birthday === 'object') {
          profile_fields.birthday = sails.moment(profile_fields.birthday).format('YYYY-MM-DD');
        }
        if (profile_fields.birthday) {
          var years = sails.moment().diff(profile_fields.birthday, 'years');
          profile_fields.pax_type = (years >= 12 ? 'ADT' : (years > 2 ? 'CHD' : 'INF'));
        }         

        
        // add program name and tier name before output
        // 
        //   miles_programs:
        //  [ { program_name: 'AMC',                                // it's program_code saved from main profile
        //      account_number: '11111',                  
        //      tier: '8',                                          // it's tiers_configuration[n].ta - saved from main profile
        //      program_name_label: 'ANA Mileage Club',             // human representation of program_code
        //      tier_label: 'Bronze' },                             // human representation of tier
        //      program_tiers: JSON.stringify(tiers_configuration)  // list of tiers for initialization
        //   ],
        //
        
        if(typeof profile_fields.miles_programs === 'array' || typeof profile_fields.miles_programs === 'object'){
          for(var i in profile_fields.miles_programs){
            var ffmp_user = profile_fields.miles_programs[i];
            
            profile_fields.miles_programs[i]['program_name_label'] = ffmp_user.program_name || ''; // ffm program label
            profile_fields.miles_programs[i]['tier_label'] = ffmp_user.tier || ''; // tier label
            
            for(var j in data.ffmprograms){ // set original program name 
              var ffmp_orig = data.ffmprograms[j];
              
              if(ffmp_orig.program_code === ffmp_user.program_name){
                profile_fields.miles_programs[i]['program_name_label'] = ffmp_orig.program_name;
                
                if(typeof ffmp_orig.tiers_configuration === 'object'){
                  
                  profile_fields.miles_programs[i]['program_tiers'] = JSON.stringify(ffmp_orig.tiers_configuration);
                  
                  for(var k in ffmp_orig.tiers_configuration){  // set original tier label from tn field
                    var tier = ffmp_orig.tiers_configuration[k];
                    
                    if(ffmp_user.tier === tier.ta){
                      
                      profile_fields.miles_programs[i]['tier_label'] = tier.tn;
                      break;
                    }
                  }
                }
                
                break;
              }
            }
          }
        }           
      
        return res.view('user/profile', {
              selectedAirline: selectedAirline,
              title:'Update profile',
              selectedUser: data.user_id,
              user: req.user,
              profile_fields: profile_fields,
              airlines: data.airlines,
              ffmprograms: data.ffmprograms
            }); 
    })
    .catch(function (error) {
      sails.log.error(error);
      res.redirect('/');
    })
    .done();
  },

  /**
   * `UserController.profile()`
   */
  update: function (req, res) {
    var profileFields = Profile.make(req.body, {id: +req.params.user_id});

    if (!profileFields.personal_info.show_tiles) {
      profileFields.personal_info.show_tiles = false;
    }

    var selectedAirline = this._setAirlineCode(req);

    User.findOne({id: req.params.user_id}).exec(function findOneCB(err, found) {
      Profile.update({user:req.params.user_id}, profileFields).exec(function (err, record) {
        if (err || _.isEmpty(record)) {
          Profile.create(profileFields).exec(function(err, record) {
            if (err) {
              sails.log.error(err);
            }
            res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/profile/' + req.params.user_id);
          });
        } else {
          res.redirect((selectedAirline ? '/' + selectedAirline : '') + '/profile/' + req.params.user_id);
        }
      });

    });

  },

  /**
   * remove fieldset from user profile
   * user/removeFieldSet
   * @param req
   * @param res
   */
  removeFieldSet: function (req, res) {
    Profile.findOneByUserId(req.user.id).exec(function (err, found) {

      if (!found) {

        sails.log.error('User not found', JSON.stringify(req.user));
        return res.json({error: err});
        
      } else {

        var fieldset = req.param('fieldset'), iterator = req.param('iterator');
        if (found[fieldset][iterator]) {

          found[fieldset].splice(iterator, 1);
          Profile.update({user: req.user.id}, found).exec(function (err, record) {
            if (err) {
              return res.json({error: err});
            }
            return res.json({'success': true});
          });

        }else{
            // if record in fieldset can't be found cause may be in the user try to delete record of fieldset before the record was saved into the database
            // front end waiting for result of operation and we must return response
            return res.json({'success': true});
        }
      }

    });
  },

  _setAirlineCode: function(req) {
    var selectedAirline = '';

    if (req.params.selectedAirline && req.params.selectedAirline.length == 2) {
      selectedAirline = req.params.selectedAirline.toUpperCase();
    }

    if (selectedAirline) {
      console.log('selectedAirline in params: ' + selectedAirline);
    }

    return selectedAirline;
  },
};
