/* global $ */
const confTripSearchForms = ['one_way','round_trip','multi_city'];

//global object for communication with react components and dispatching redux actions
var ActionsStore = {
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

let handleChangeTripSearchForm = (searchParams) => {
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
var logAction = function (type, data) {
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
let unfocusFormForIos;
unfocusFormForIos = function () {
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
};

let nodes = [];

const ReactContentRenderer = {
  unmountAll() {
    if (nodes.length === 0) {
      return;
    }
    nodes.forEach(node => React.unmountComponentAtNode(node));
    nodes = [];
  },
  render(element, container, callback) {
    if (container instanceof jQuery) {
      container = container.get(0);
    }
    ReactDOM.render(element, container, callback);
    nodes.push(container);
  }
};

$(function () {
  $('#content')
    .on('content-will-change', ReactContentRenderer.unmountAll);
});






