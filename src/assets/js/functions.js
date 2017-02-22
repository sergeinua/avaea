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
  },

  loadMilesInfo: (ids) => {
    let milesInfosObject = clientStore.getState().commonData.ffmiles;


    let idsLoadingNotStartedAndNotLoaded = ids.filter((id) => {
      // miles value meaning:
      // miles === undefined // not loaded
      let miles = milesInfosObject[id];
      return (
        miles === undefined
        || (!miles.isLoading && !miles.isLoaded && !miles.isError)
      );
    });

    if (idsLoadingNotStartedAndNotLoaded.length > 0) {
      setMilesInfoLoadingStarted(milesInfosObject, idsLoadingNotStartedAndNotLoaded);
      ClientApi.reqPost('/ac/ffpcalculateMany', {ids: idsLoadingNotStartedAndNotLoaded}, true)
        .then((msg) => {
          if (msg.error) {
            console.log("Result of 30K api: " + JSON.stringify(msg));
            return setMilesInfoLoadingFailed(milesInfosObject, idsLoadingNotStartedAndNotLoaded);
          }

          let updatedMilesInfosObject = {};
          let idsLoadedObject = {};
          msg.itineraries.forEach(({id, ffmiles: {miles, ProgramCodeName} = {}}) => {
            idsLoadedObject[id] = true;
            updatedMilesInfosObject[id] = {
              isLoading: false,
              isLoaded: true,
              isError: false,
              value: miles || 0,
              name: ProgramCodeName
            }
          });
          let idsFailedToLoad = idsLoadingNotStartedAndNotLoaded.filter((id) => !idsLoadedObject[id]);
          idsFailedToLoad.forEach((id) => {
            updatedMilesInfosObject[id] = {
              isLoading: false,
              isLoaded: false,
              isError: true,
              value: 0,
              name: ''
            }
          });

          let loadingMilesUpdated = Object.keys(updatedMilesInfosObject)
            .map((itineraryId) => [['ffmiles', itineraryId], updatedMilesInfosObject[itineraryId]]);
          return clientStore.dispatch(actionMergeCommonVal(loadingMilesUpdated));

        })
        .catch((error) => {
          console.log("Result of 30K api: " + JSON.stringify(error));
          return setMilesInfoLoadingFailed(milesInfosObject, idsLoadingNotStartedAndNotLoaded);
        })
      ;
    }
  },

  defineCabinClass: itineraryData => {
    return serviceClass[itineraryData.cabinClass] ? serviceClass[itineraryData.cabinClass] : 'UNKNOWN';
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

function setMilesInfoLoadingStarted(milesInfosObject, ids) {
  return _setMilesInfoLoadingState(true, false, false, milesInfosObject, ids);
}

function setMilesInfoLoadingFailed(milesInfosObject, ids) {
  return _setMilesInfoLoadingState(false, false, true, milesInfosObject, ids);
}

function _setMilesInfoLoadingState(isLoading, isLoaded, isError, milesInfosObject, ids) {
  let loadingMilesFailed = ids.map((itineraryId) => {
    let miles = milesInfosObject[itineraryId];
    return [['ffmiles', itineraryId], {
      isLoading: isLoading,
      isLoaded: isLoaded,
      isError: isError,
      value: miles ? miles.value : 0,
      name: miles ? miles.name : ''
    }]
  });
  return clientStore.dispatch(actionMergeCommonVal(loadingMilesFailed));
}

export function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options) {
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
  let moment_now = moment();
  let tmpDefaultDepDate = moment().add(2, 'w');
  let tmpDefaultRetDate = moment().add(4, 'w');
  let nextFirstDateMonth = moment().add(1, 'M').startOf('month');

  if (nextFirstDateMonth.diff(tmpDefaultDepDate, 'days') > tmpDefaultRetDate.diff(nextFirstDateMonth, 'days')) {
    tmpDefaultRetDate = moment(tmpDefaultDepDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
    tmpDefaultRetDate = tmpDefaultRetDate.endOf('month');
  } else {
    tmpDefaultDepDate = moment(tmpDefaultRetDate.format('YYYY-MM-DD'), 'YYYY-MM-DD');
    tmpDefaultDepDate = tmpDefaultDepDate.startOf('month');
  }

  if (defaultParams.departureDate) {
    let moment_dp = moment(defaultParams.departureDate, "YYYY-MM-DD");

    // Check depart date
    if (moment_dp &&
      (
        moment_dp.isBefore(moment_now, 'day') ||
        moment_dp.diff(moment_now, 'days') >= searchApiMaxDays - 1
      )
    ) {
      defaultParams.departureDate = tmpDefaultDepDate.format('YYYY-MM-DD');
    }
  }

  if (defaultParams.returnDate) {
    let moment_rp = moment(defaultParams.returnDate, "YYYY-MM-DD");
    let moment_dp = moment(defaultParams.departureDate, "YYYY-MM-DD");
    // Check return date
    if (moment_rp &&
      (
        moment_rp.diff(moment_now, 'days') >= searchApiMaxDays - 1 ||
        moment_rp.isSameOrBefore(moment_dp, 'day')
      )
    ) {
      defaultParams.returnDate = tmpDefaultRetDate.format('YYYY-MM-DD');
    }
  }

  return defaultParams;
};

export function getUser() {
  return InitData.user || false;
}

export function fixStorageAvailability() {
  //fix for ios safari incognito mode
  try {
    localStorage.setItem('StorageTest', 1);
    localStorage.getItem('StorageTest');
    localStorage.removeItem('StorageTest');
    sessionStorage.setItem('StorageTest', 1);
    sessionStorage.getItem('StorageTest');
    sessionStorage.removeItem('StorageTest');
  } catch (e) {
    console.log("sessionStorage and localStorage mocked");
    sessionStorage.setItem = function() {};
    sessionStorage.getItem = function() {};
    localStorage.setItem = function() {};
    localStorage.getItem = function() {};
  }
}

