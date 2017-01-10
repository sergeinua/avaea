import * as Redux from 'redux';
import * as Immutable from 'immutable';
import { actionTypesCommon, actionTypesProfile, actionTypesOrder } from 'actions.js';

export const storeInitialState = {
  commonData: {
    searchParams: {
      flightType: 'round_trip'
    },
    ffmiles: {},
    iconSpriteMap: [],
    currentForm: 'round_trip',
    airportChoiceTarget: 'DepartureLocationCode',
    formErrors: {
      isError: false,
      departureDate: false,
      returnDate: false,
      fromArea: false,
      toArea: false,
    },
    formSubmitCount: 0,
  },
  profileData: {},
  orderData: {}
};

export const storeGetCommonVal = (curState, fieldName) => {
  return curState.commonData[fieldName];
};

const storeAssignObj = (curState, objData) => {
  return Object.assign(... curState, objData);
};

const storeSetFieldsDataVal = (curState, fieldName, fieldValue) => {
  let _immutable = Immutable.fromJS(curState);
  return _immutable.updateIn(['fieldsData', fieldName], () => fieldValue).toJS();
};

const storeSetVal = (curState, fieldName, fieldValue) => {
  let _immutable = Immutable.fromJS(curState);
  return _immutable.updateIn(typeof fieldName == 'string' ? [fieldName] : fieldName, () => fieldValue).toJS();
};

const storeMergeVal = (curState, itemsData) => { // [[0=>key/or path, 1=>value],...]
  let _immutable = [Immutable.fromJS(curState)];
  let fieldName, fieldValue;
  let ii;
  for (ii=0; ii < itemsData.length; ii++) {
    fieldName = itemsData[ii][0];
    fieldValue = itemsData[ii][1];
    _immutable[ii+1] = _immutable[ii].updateIn(typeof fieldName == 'string' ? [fieldName] : fieldName, () => fieldValue);
    delete _immutable[ii];
  }
  return _immutable[ii].toJS();
};

const storeUpdateByVal = (curState, fieldName, updateByVal) => {
  let _immutable = Immutable.fromJS(curState);
  return _immutable.updateIn(typeof fieldName == 'string' ? [fieldName] : fieldName, value => value + updateByVal).toJS();
};


function profileReducer(curState = storeInitialState.profileData, action) {
  let _immutable;

  switch (action.type) {

    case actionTypesProfile.LOAD_PROFILE_SUCCESS:
    case actionTypesProfile.LOAD_PROFILE_FAILED:
      return storeAssignObj(curState, action.payload);

    case actionTypesProfile.SET_PERSONAL_VAL:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['personal', action.elemNum, 'data'], () => action.value).toJS();

    case actionTypesProfile.SET_PERSONAL_VALIDATOR:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['personal', action.elemNum, 'validated'], () => action.validator).toJS();

    case actionTypesProfile.SET_PERSONAL_NOTIFY_VAL:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['notifyContact', action.elemNum, 'data'], () => action.value).toJS();

    case actionTypesProfile.SET_PROGRAMS_VAL:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['programs', action.blockNum, 'data', action.elemNum, action.fieldName], () => action.value).toJS();

    case actionTypesProfile.SET_PREFERREDAIRLINES_VAL:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['preferredAirlines', action.blockNum, 'data', action.elemNum, action.fieldName], () => action.value).toJS();

    default:
      return curState;
  }
}

function orderReducer(curState = storeInitialState.orderData, action) {
  switch (action.type) {

    case actionTypesOrder.LOAD_ORDER_SUCCESS:
    case actionTypesOrder.LOAD_ORDER_FAILED:
      return storeAssignObj(curState, action.payload);

    case actionTypesOrder.SET_ORDER_FIELD_VAL:
      return storeSetFieldsDataVal(curState, action.fieldName, action.fieldValue);

    default:
      return curState;
  }
}

function commonReducer(curState = storeInitialState.commonData, action) {
  switch (action.type) {

    case actionTypesCommon.SET_COMMON_VAL:
      return storeSetVal(curState, action.fieldName, action.fieldValue);

    case actionTypesCommon.MERGE_COMMON_VAL:
      return storeMergeVal(curState, action.itemsData);

    case actionTypesCommon.UPDATE_COMMON_BY_VAL:
      return storeUpdateByVal(curState, action.fieldName, action.updateByVal);

    default:
      return curState;
  }
}

// Combine application reducers
const appReducers = Redux.combineReducers({
  commonData: commonReducer,
  profileData: profileReducer,
  orderData: orderReducer,
});

export const clientStore = Redux.createStore(appReducers);
//for test env only
// export const clientStore = Redux.createStore(appReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


// global, because subscribers can be re-mounted many times
let observeStoreFields = {};
export let observeUnsubscribers = {};

// Observe store for changed values. And call handler if need
// Be careful with this code and code of the calling handlers. Because if handler dispatch the same data again then you can make eternal races
export const observeStore = (handleGetVal, fieldName, handleOnChangeStore) => {
  let cur_val;
  if (['formSubmitCount','searchParams'].indexOf(fieldName) == -1) {
    console.error('Unknown observed field:', fieldName);
    return false;
  }
  let cur_field = fieldName;
  let is_need_call;

  function handleChangeStore() {
    cur_val = observeStoreFields[cur_field];
    let next_val = handleGetVal(clientStore.getState(), cur_field);

    is_need_call = false;
    if (typeof next_val == 'object') {
      is_need_call = JSON.stringify(next_val) != JSON.stringify(cur_val);
    }
    else {
      is_need_call = next_val != cur_val;
    }

    if (is_need_call) {
      observeStoreFields[cur_field] = next_val;
      handleOnChangeStore(observeStoreFields[cur_field]);
    }
  }

  observeUnsubscribers[cur_field] = clientStore.subscribe(handleChangeStore);
  handleChangeStore();
  return observeUnsubscribers[cur_field];
};
