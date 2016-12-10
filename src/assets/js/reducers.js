
const storeInitialState = {
  commonData: {
    searchParams: {
      flightType: 'round_trip'
    },
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

const storeGetCommonVal = (curState, fieldName) => {
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

    case actionTypesProfile.SET_PROGRAMS_VAL:
      _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['programs', action.blockNum, 'data', action.elemNum, action.fieldName], () => action.value).toJS();

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


// Create store
const clientStore = Redux.createStore(appReducers);

// let observe_searchParams, observe_formSubmitCount;

// global, because subscribers can be re-mounted many times
let observeStoreFields = {};
let observeUnsubscribers = {};

// Observe store for changed values. And call handler if need
// Be careful with this code and code of the calling handlers. Because if handler dispatch the same data again then you can make eternal races
const observeStore = (handleGetVal, fieldName, handleOnChangeStore) => {
  let cur_val;
  if (['formSubmitCount','searchParams'].indexOf(fieldName) == -1) {
    console.error('Unknown observed field:', fieldName);
    return false;
  }
  let cur_field = fieldName;
  let is_need_call;

  function handleChangeStore() {
    // cur_val = cur_field == 'formSubmitCount' ? observe_formSubmitCount : observe_searchParams;
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
      // console.log('_nextVal,cur', cur_field, typeof next_val, next_val, cur_val, observe_formSubmitCount, observe_searchParams);
      console.log('_nextVal,cur', cur_field, typeof next_val, next_val, cur_val, observeStoreFields);
      // if (cur_field == 'formSubmitCount') {
      //   call_val = observe_formSubmitCount = next_val;
      // }
      // else {
      //   call_val = observe_searchParams = next_val;
      // }
      observeStoreFields[cur_field] = next_val;
      handleOnChangeStore(observeStoreFields[cur_field]);
    }
  }

  observeUnsubscribers[cur_field] = clientStore.subscribe(handleChangeStore);
  handleChangeStore();
  console.log('run observeStore');
  return observeUnsubscribers[cur_field];
};

// 2nd variant - via fields array iterating
// let observeStoreHandlers = [];
// const observeStore = (handleGetVal, fieldName, handleOnChangeStore) => {
//
//   let cur_val, cur_field, cur_handler, call_val;
//   let is_need_call;
//   let observe_fields = ['formSubmitCount','searchParams'];
//   observeStoreHandlers[fieldName] = handleOnChangeStore;
//
//   function listenStore() {
//
//     for (var ii=0; ii < observe_fields.length; ii++) {
//       cur_field = observe_fields[ii];
//
//       cur_val = cur_field == 'formSubmitCount' ? observe_formSubmitCount : observe_searchParams;
//       let next_val = handleGetVal(clientStore.getState(), cur_field);
//
//       is_need_call = false;
//       if (typeof next_val == 'object') {
//         is_need_call = JSON.stringify(next_val) != JSON.stringify(cur_val);
//       }
//       else {
//         is_need_call = next_val != cur_val;
//       }
//
//       if (is_need_call) {
//         console.log('_nextVal,cur', cur_handler, cur_field, typeof next_val, next_val, cur_val, observe_formSubmitCount, observe_searchParams);
//         if (cur_field == 'formSubmitCount') {
//           call_val = observe_formSubmitCount = next_val;
//         }
//         else {
//           call_val = observe_searchParams = next_val;
//         }
//
//         cur_handler = observeStoreHandlers[cur_field];
//         if (typeof cur_handler == 'function') {
//           cur_handler(call_val);
//         }
//       }
//     }
//   }
//
//   let unsubscribe = clientStore.subscribe(listenStore);
//   listenStore();
//   console.log('run observeStore');
//   return unsubscribe;
// };

// function observeStore(store, select, onChange) {
//   let currentState;
//
//   function handleChange() {
//     let nextState = select(store.getState());
//     if (nextState !== currentState) {
//       currentState = nextState;
//       onChange(currentState);
//     }
//   }
//
//   let unsubscribe = store.subscribe(handleChange);
//   handleChange();
//   return unsubscribe;
// }