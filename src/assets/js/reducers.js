
const storeInitialState = {
  profileData: {},
  orderData: {}
};

function profileReducer(state = storeInitialState, action) {
  switch (action.type) {

    case actionTypesProfile.LOAD_PROFILE_SUCCESS:
    case actionTypesProfile.LOAD_PROFILE_FAILED:
      return Object.assign(... state, action.payload);

    case actionTypesProfile.SET_PERSONAL_VAL:
      var _immutable = Immutable.fromJS(state);
      return _immutable.updateIn(['personal', action.elemNum, 'data'], () => action.value).toJS();

    case actionTypesProfile.SET_PROGRAMS_VAL:
      var _immutable = Immutable.fromJS(state);
      return _immutable.updateIn(['programs', action.blockNum, 'data', action.elemNum, action.fieldName], () => action.value).toJS();

    default:
      return state
  }
}

function commonReducer(state = storeInitialState, action) {
  switch (action.type) {

    case actionTypesCommon.LOAD_SUCCESS:
    case actionTypesCommon.LOAD_FAILED:
      return Object.assign(... state, action.payload);

    case actionTypesCommon.SET_FIELD_VAL:
      var _immutable = Immutable.fromJS(state);
      return _immutable.updateIn(['fieldsData', action.fieldName], () => action.fieldValue).toJS();

    default:
      return state
  }
}

// Combine application reducers
const appReducers = Redux.combineReducers({
  profileData: profileReducer,
  orderData: commonReducer,
});


// Create store
const clientStore = Redux.createStore(appReducers);