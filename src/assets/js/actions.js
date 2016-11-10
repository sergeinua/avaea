
const actionTypesProfile = {
  LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
  LOAD_PROFILE_FAILED: 'LOAD_PROFILE_FAILED',
  SET_PERSONAL_VAL: 'SET_PERSONAL_VAL',
  SET_PROGRAMS_VAL: 'SET_PROGRAMS_VAL',
};

function actionLoadProfileSuccess (data) {
  return {
    type: actionTypesProfile.LOAD_PROFILE_SUCCESS,
    payload: data
  }
}

function actionSetPersonalVal (elemNum, value) {
  return {
    type: actionTypesProfile.SET_PERSONAL_VAL,
    elemNum: elemNum,
    value: value
  }
}

function actionSetProgramsVal (blockNum, elemNum, fieldName, value) {
  return {
    type: actionTypesProfile.SET_PROGRAMS_VAL,
    blockNum: blockNum,
    elemNum: elemNum,
    fieldName: fieldName,
    value: value
  }
}

function actionLoadProfileFailed () { // @todo display error
  return {
    type: actionTypesProfile.LOAD_PROFILE_FAILED,
    payload: {error: true}
  }
}