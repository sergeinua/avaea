
export const actionTypesProfile = {
  LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
  LOAD_PROFILE_FAILED: 'LOAD_PROFILE_FAILED',
  SET_PERSONAL_VAL: 'SET_PERSONAL_VAL',
  SET_PROGRAMS_VAL: 'SET_PROGRAMS_VAL',
  SET_PERSONAL_NOTIFY_VAL: 'SET_PERSONAL_NOTIFY_VAL',
  SET_PREFERREDAIRLINES_VAL: 'SET_PREFERREDAIRLINES_VAL',
  SET_PERSONAL_VALIDATOR: 'SET_PERSONAL_VALIDATOR'
};
export const actionTypesOrder = {
  LOAD_ORDER_SUCCESS: 'LOAD_ORDER_SUCCESS',
  LOAD_ORDER_FAILED: 'LOAD_ORDER_FAILED',
  SET_ORDER_FIELD_VAL: 'SET_ORDER_FIELD_VAL',
};
export const actionTypesCommon = {
  SET_COMMON_VAL: 'SET_COMMON_VAL',
  MERGE_COMMON_VAL: 'MERGE_COMMON_VAL',
  UPDATE_COMMON_BY_VAL: 'UPDATE_COMMON_BY_VAL',
};

//// Profile
export function actionLoadProfileSuccess (data) {
  return {
    type: actionTypesProfile.LOAD_PROFILE_SUCCESS,
    payload: data
  }
}

export function actionSetPersonalVal (elemNum, value) {
  return {
    type: actionTypesProfile.SET_PERSONAL_VAL,
    elemNum: elemNum,
    value: value
  }
}

export function actionSetPersonalValidator (elemNum, validator) {
  return {
    type: actionTypesProfile.SET_PERSONAL_VALIDATOR,
    elemNum: elemNum,
    validator: validator
  }
}

export function actionSetPersonalNotifyVal (elemNum, value) {
  return {
    type: actionTypesProfile.SET_PERSONAL_NOTIFY_VAL,
    elemNum: elemNum,
    value: value
  }
}

export function actionSetProgramsVal (blockNum, elemNum, fieldName, value) {
  return {
    type: actionTypesProfile.SET_PROGRAMS_VAL,
    blockNum: blockNum,
    elemNum: elemNum,
    fieldName: fieldName,
    value: value
  }
}

export function actionSetPreferredAirlinesVal (blockNum, elemNum, fieldName, value) {
  return {
    type: actionTypesProfile.SET_PREFERREDAIRLINES_VAL,
    blockNum: blockNum,
    elemNum: elemNum,
    fieldName: fieldName,
    value: value
  }
}

export function actionLoadProfileFailed () {
  return {
    type: actionTypesProfile.LOAD_PROFILE_FAILED,
    payload: {error: true}
  }
}

//// Order
export function actionLoadOrderSuccess (data) {
  return {
    type: actionTypesOrder.LOAD_ORDER_SUCCESS,
    payload: data
  }
}

export function actionSetOrderFieldVal (fieldName, fieldValue) {
  return {
    type: actionTypesOrder.SET_ORDER_FIELD_VAL,
    fieldName: fieldName,
    fieldValue: fieldValue
  }
}

export function actionLoadOrderFailed (data) {
  let result = {error: true};
  if (data.errorInfo) {
    result.errorInfo = data.errorInfo;
  }
  return {
    type: actionTypesOrder.LOAD_ORDER_FAILED,
    payload: result
  }
}

//// Common
export function actionSetCommonVal (fieldName, fieldValue) {
  return {
    type: actionTypesCommon.SET_COMMON_VAL,
    fieldName: fieldName,
    fieldValue: fieldValue
  }
}

export function actionMergeCommonVal (itemsData) {
  return {
    type: actionTypesCommon.MERGE_COMMON_VAL,
    itemsData: itemsData,
  }
}

export function actionUpdateCommonByVal (fieldName, updateByVal) {
  return {
    type: actionTypesCommon.UPDATE_COMMON_BY_VAL,
    fieldName: fieldName,
    updateByVal: updateByVal
  }
}
