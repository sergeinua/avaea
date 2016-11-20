
const actionTypesProfile = {
  LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
  LOAD_PROFILE_FAILED: 'LOAD_PROFILE_FAILED',
  SET_PERSONAL_VAL: 'SET_PERSONAL_VAL',
  SET_PROGRAMS_VAL: 'SET_PROGRAMS_VAL',
};
const actionTypesCommon = {
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAILED: 'LOAD_FAILED',
  SET_FIELD_VAL: 'SET_FIELD_VAL',
};
////

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

function actionLoadProfileFailed () {
  return {
    type: actionTypesProfile.LOAD_PROFILE_FAILED,
    payload: {error: true}
  }
}
////

function actionLoadSuccess (data) {
  return {
    type: actionTypesCommon.LOAD_SUCCESS,
    payload: data
  }
}

function actionSetFieldVal (fieldName, fieldValue) {
  return {
    type: actionTypesCommon.SET_FIELD_VAL,
    fieldName: fieldName,
    fieldValue: fieldValue
  }
}

function actionLoadFailed () {
  return {
    type: actionTypesCommon.LOAD_FAILED,
    payload: {error: true}
  }
}