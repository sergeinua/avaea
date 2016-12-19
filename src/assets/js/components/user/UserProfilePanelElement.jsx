import * as ReactRedux from 'react-redux';
import FormElement from '../_common/FormElement.jsx';
import { actionSetPersonalVal } from '../../actions.js';

const mapDispatchPanelElem = (dispatch, ownProps) => {
  return {
    handleChangeValue: (event) => {
      dispatch(actionSetPersonalVal(ownProps.elemNum, event.target.value));
    },
  }
};

let UserProfilePanelElement = ReactRedux.connect(null, mapDispatchPanelElem)(FormElement);

export default UserProfilePanelElement;
