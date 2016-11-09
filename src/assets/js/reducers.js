
const storeInitialState = {
  profileData: {}
};

function profileReducer(state = storeInitialState, action) {
  switch (action.type) {

    case actionTypesProfile.LOAD_PROFILE_SUCCESS:
    case actionTypesProfile.LOAD_PROFILE_FAILED:
      return Object.assign(... state, action.payload);

    default:
      return state
  }
}


// Combine application reducers
const appReducers = Redux.combineReducers({
  profileData: profileReducer,
});


// Create store
const clientStore = Redux.createStore(appReducers);