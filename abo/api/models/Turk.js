var bcrypt = require('bcryptjs');

/**
 * Turk.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    turkId  : { type: 'string', unique: true, primaryKey: true, autoPK: true },
    counter : { type: 'integer' }
  },

  findOneByTurkId: function (id) {
    return this.findOne({turkId:id});
  },

  make: function (counter) {

    var jsonStruct = {
      turkId: '',
      counter: counter
    };

    jsonStruct.turkId = bcrypt.hashSync('' + Math.random(), bcrypt.genSaltSync(10));

    return jsonStruct;
  }
};
