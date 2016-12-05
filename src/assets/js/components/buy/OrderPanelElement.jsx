
const mapDispatchOrderElem = (dispatch) => {
  return {
    handleChangeValue: (event) => {
      dispatch(actionSetOrderFieldVal(event.target.name, event.target.value));
    },
  }
};

var OrderPanelElement = ReactRedux.connect(null, mapDispatchOrderElem)(FormElement);