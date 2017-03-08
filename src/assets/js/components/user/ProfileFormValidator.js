import { clientStore } from '../../reducers.js';
import { actionSetPersonalValidator } from '../../actions.js';
import postalCodes from 'postcode-validator';

let Validations = {
  alpha: function(val) {
    return /^[A-Z'\-]+$/i.test(val);
  },

  required: function(val) {
    if (!val) {
      return false;
    }
    val = val.trim();
    return val.length > 0;
  },

  email: function(val) {
    if (val.length) {
      return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(val);
    }
  },

  phone: function(val) {
    if (val.length) {
      return /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/.test(val);
    }
    return true;
  },

  postalCode: function(val) {
    let countryCode = '';
    let data = clientStore.getState();
    data.profileData.personal.map((item) => {
      if (item.id == 'personal_info.address.country_code') {
        countryCode = item.data;
      }
      return item;
    });
    if (countryCode) {
      return postalCodes.validate(val, countryCode);
    }
    return false;
  }
};

export let validateField = (data, value) => {
  if (data.item && data.item.validator) {
    if (Array.isArray(data.item.validator.name)) {
      let _validator = [];
      data.item.validator.name.forEach(function(item) {
        if (item in Validations) {
          if (Validations[item](value) === false) {
            _validator.push(item);
          }
        }
      });
      clientStore.dispatch(actionSetPersonalValidator(data.elemNum, _validator));
      return _validator;
    }
  }
};

export let validateFormPersonal = (data) => {
  let isValid = true;
  data.forEach(function(item, index) {
    if ('validator' in item) {
      let _resValidator = validateField({
        elemNum: index,
        item: {validator: item.validator}
      }, item.data);
      if (_resValidator.length) {
        isValid = false;
      }
    }
  });

  return isValid;
};
