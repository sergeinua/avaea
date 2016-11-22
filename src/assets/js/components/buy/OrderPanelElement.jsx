
const mapDispatchOrderElem = (dispatch) => {
  return {
    handleChangeValue: (event) => {
      dispatch(actionSetFieldVal(event.target.name, event.target.value));
    },
  }
};

var OrderPanelElement = ReactRedux.connect(null, mapDispatchOrderElem)(FormElement);