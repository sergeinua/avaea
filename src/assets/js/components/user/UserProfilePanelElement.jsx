
const mapDispatchPanelElem = (dispatch, ownProps) => {
  return {
    handleChangeValue: (event) => {
      dispatch(actionSetPersonalVal(ownProps.elemNum, event.target.value));
    },
  }
};

var UserProfilePanelElement = ReactRedux.connect(null, mapDispatchPanelElem)(FormElement);
