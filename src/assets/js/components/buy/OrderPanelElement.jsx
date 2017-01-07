import React from 'react';
import * as ReactRedux from 'react-redux';
import {actionSetOrderFieldVal} from '../../actions.js';
import FormElement from '../_common/FormElement.jsx';

const mapDispatchOrderElem = (dispatch) => {
  return {
    handleChangeValue: (event) => {
      dispatch(actionSetOrderFieldVal(event.target.name, event.target.value));
    },
  }
};

let OrderPanelElement = ReactRedux.connect(null, mapDispatchOrderElem)(FormElement);

export default OrderPanelElement;
