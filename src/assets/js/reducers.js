
const storeInitialState = {
  commonData: {
    searchParams: {},
    page: '', // NavBar page
  },
  profileData: {},
  orderData: {}
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
  return _immutable.updateIn([fieldName], () => fieldValue).toJS();
};


function profileReducer(curState = storeInitialState.profileData, action) {
  switch (action.type) {

    case actionTypesProfile.LOAD_PROFILE_SUCCESS:
    case actionTypesProfile.LOAD_PROFILE_FAILED:
      return storeAssignObj(curState, action.payload);

    case actionTypesProfile.SET_PERSONAL_VAL:
      var _immutable = Immutable.fromJS(curState);
      return _immutable.updateIn(['personal', action.elemNum, 'data'], () => action.value).toJS();

    case actionTypesProfile.SET_PROGRAMS_VAL:
      var _immutable = Immutable.fromJS(curState);
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