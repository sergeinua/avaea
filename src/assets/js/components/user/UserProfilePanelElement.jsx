import * as ReactRedux from 'react-redux';
import FormElement from '../_common/FormElement.jsx';
import { actionSetPersonalVal, actionSetPersonalNotifyVal } from '../../actions.js';
import { validateField } from './ProfileFormValidator'

const mapDispatchPanelElem = (dispatch, ownProps) => {
  return {
    handleChangeValue: (event) => {
      if (ownProps.panelType && ownProps.panelType === 'notifyContact') {
        dispatch(actionSetPersonalNotifyVal(ownProps.elemNum, event.target.value))
      } else {
        dispatch(actionSetPersonalVal(ownProps.elemNum, event.target.value))
      }
      validateField(ownProps, event.target.value)
    }
  }
};

let UserProfilePanelElement = ReactRedux.connect(null, mapDispatchPanelElem)(FormElement);

export default UserProfilePanelElement;
