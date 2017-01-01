import { clientStore } from 'reducers.js';
import { actionSetCommonVal, actionMergeCommonVal, actionUpdateCommonByVal } from 'actions.js';
import ClientApi from 'components/_common/api.js';
import moment from 'moment';

export const confTripSearchForms = ['one_way','round_trip','multi_city'];

export let createMarkup = function(text) { return {__html: text}; };

//global object for communication with react components
export let ActionsStore = {
  getIconSpriteMap: function () {
    return clientStore.getState().commonData.iconSpriteMap;
  },

  changeForm: (form, isUnfocusForIos=true) => {
    if (isUnfocusForIos) {
      unfocusFormForIos();
    }
    form = form.toLowerCase();

    if (confTripSearchForms.indexOf(form) != -1) {
      let items_data = [
        ['currentForm', form],
        [['searchParams','flightType'], form]
      ];
      clientStore.dispatch(actionMergeCommonVal(items_data));
    }
    else {
      clientStore.dispatch(actionSetCommonVal('currentForm', form));
    }
  },

  setFormValue: (target, value) => {
    return clientStore.dispatch(actionSetCommonVal(['searchParams', target], value));
  },

  setTarget: (target) => {
    clientStore.dispatch(actionSetCommonVal('airportChoiceTarget', target));
  },

  submitTripSearchForm: () => {
    clientStore.dispatch(actionUpdateCommonByVal('formSubmitCount', 1));
  }
};

export let searchApiMaxDays = 330; // Mondee API restriction for search dates at this moment

export let handleChangeTripSearchForm = (searchParams) => {
  let formErrors = {
    isError: false,
    departureDate: false,
    returnDate: false,
    fromArea: false,
    toArea: false,
  };

  let flightType = searchParams.flightType || 'round_trip';
  let departureDate = searchParams.departureDate;
  let moment_dp = moment(departureDate, "YYYY-MM-DD");
  let returnDate = searchParams.returnDate;
  let moment_rp = moment(returnDate, "YYYY-MM-DD");

  let moment_now = moment();
  // Check depart date
  if (moment_dp &&
    (
      moment_dp.isBefore(moment_now, 'day') ||
      moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1
    )
  ) {
    formErrors.departureDate = true;
    formErrors.isError = true;
  }

  // Check return date
  if (flightType == 'round_trip') {
    if (moment_rp && moment_rp.diff(moment_now, 'days') >= searchApiMaxDays - 1) {
      formErrors.returnDate = true;
      formErrors.isError = true;
    }
    if (!returnDate) {
      formErrors.returnDate = true;
      formErrors.isError = true;
    }
    if (moment_dp && moment_rp && moment_rp.isBefore(moment_dp, 'day')) {
      formErrors.returnDate = true;
      formErrors.isError = true;
    }
  }

  if (!departureDate) {
    formErrors.departureDate = true;
    formErrors.isError = true;
  }

  // Check airports selection
  if (searchParams.DepartureLocationCode == '') {
    formErrors.fromArea = true;
    formErrors.isError = true;
  }
  if (searchParams.ArrivalLocationCode == '') {
    formErrors.toArea = true;
    formErrors.isError = true;
  }
  if (searchParams.DepartureLocationCode == searchParams.ArrivalLocationCode) {
    formErrors.fromArea = true;
    formErrors.toArea = true;
    formErrors.isError = true;
  }

  clientStore.dispatch(actionSetCommonVal('formErrors', formErrors));
};

var isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
    return (typeof window.orientation !== 'undefined' // Deprecated legacy property. But remains for browser which support it
    || isMobile.Android() || isMobile.iOS() || isMobile.Windows() || isMobile.Opera() || isMobile.BlackBerry());
  }
};


/**
 * Possible types
 * on_tile_choice | on_itinerary_purchase etc...
 *
 */
export let logAction = function (type, data) {
  ClientApi.reqPost("/prediction/" + type, data);
};

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}

$(document).ready(function() {

  // app screens nav slide menu is in NavBar.jsx

  // detect IE10 or IE11 and append string
  var doc = document.documentElement;
  doc.setAttribute('data-useragent', navigator.userAgent);

});
// ends dom ready

// DEMO-796 fix for iOS10
export function unfocusFormForIos() {
  let index;
  let inputs = document.getElementsByTagName('input');
  for (index = 0; index < inputs.length; ++index) {
    inputs[index].blur();
  }
  let selects = document.getElementsByTagName('select');
  for (index = 0; index < selects.length; ++index) {
    selects[index].blur();
  }
  let textareas = document.getElementsByTagName('textarea');
  for (index = 0; index < textareas.length; ++index) {
    textareas[index].blur();
  }
}

export function setAirportData(target, data) {
  ActionsStore.setFormValue(target, data.value);
  ActionsStore.setFormValue(target + 'City', data.city);
}

export let getDefaultDateSearch = (defaultParams) => {
  let moment_now = moment()
  let tmpDefaultDepDate = moment().add(2, 'w')
  let tmpDefaultRetDate = moment().add(4, 'w')
  let nextFirstDateMonth = moment().add(1, 'M').startOf('month');

  if (nextFirstDateMonth.diff(tmpDefaultDepDate, 'days') > tmpDefaultRetDate.diff(nextFirstDateMonth, 'days')) {
    tmpDefaultRetDate = moment(tmpDefaultDepDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
    tmpDefaultRetDate = tmpDefaultRetDate.endOf('month');
  } else {
    tmpDefaultDepDate = moment(tmpDefaultRetDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
    tmpDefaultDepDate = tmpDefaultDepDate.startOf('month');
  }

  if (defaultParams.departureDate) {
    let moment_dp = moment(defaultParams.departureDate, "YYYY-MM-DD")

    // Check depart date
    if (moment_dp &&
      (
        moment_dp.isBefore(moment_now, 'day') ||
        moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1
      )
    ) {
      defaultParams.departureDate = tmpDefaultDepDate.format('YYYY-MM-DD')
    }
  }

  if (defaultParams.returnDate) {
    let moment_rp = moment(defaultParams.returnDate, "YYYY-MM-DD")
    let moment_dp = moment(defaultParams.departureDate, "YYYY-MM-DD")

    // Check return date
    if (moment_rp &&
      (
        moment_rp.diff(moment_now, 'days') >= searchApiMaxDays - 1 ||
        moment_rp.isBefore(moment_dp, 'day')
      )
    ) {
      defaultParams.returnDate = tmpDefaultRetDate.format('YYYY-MM-DD')
    }
  }

  return defaultParams
}
