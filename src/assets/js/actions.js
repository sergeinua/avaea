
const actionTypesProfile = {
  LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
  LOAD_PROFILE_FAILED: 'LOAD_PROFILE_FAILED',
};

function actionLoadProfileSuccess (data) {
  return {
    type: actionTypesProfile.LOAD_PROFILE_SUCCESS,
    payload: data
  }
}

function actionLoadProfileFailed () { // @todo display error
  return {
    type: actionTypesProfile.LOAD_PROFILE_FAILED,
    payload: {}
  }
}