import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetCommonVal } from '../../actions.js';

const ClassChooser = React.createClass({
  render() {
    return (
      <span>
        <div id="economy"
            onClick={(e) => this.props.changeClass(e, 'E')}
            className={["choice"] + [this.props.searchParams.CabinClass == 'E' ? " active":""]}>
            Economy</div>

        <div id="premium"
            onClick={(e) => this.props.changeClass(e, 'P')} data-cabinclass="P"
            className={["choice"] + [this.props.searchParams.CabinClass == 'P' ? " active":""]}>
            Premium</div>

        <div id="business"
            onClick={(e) => this.props.changeClass(e, 'B')} data-cabinclass="B"
            className={["choice"] + [this.props.searchParams.CabinClass == 'B' ? " active":""]}>
            Business</div>

        <div id="first"
            onClick={(e) => this.props.changeClass(e, 'F')} data-cabinclass="F"
            className={["choice"] + [this.props.searchParams.CabinClass == 'F' ? " active":""]}>
            First Class</div>
      </span>
    )
  }
});


const mapDispatchToPropsClassChooser = (dispatch, ownProps) => {
  return {
    changeClass: (event, cabinClass) => {
      dispatch(actionSetCommonVal(['searchParams', 'CabinClass'], cabinClass));
      if (ownProps.onClick && typeof(ownProps.onClick) == 'function') {
        ownProps.onClick();
      }
    },
  }
};

const mapStateToPropsClassChooser = function(store) {
  return {
    searchParams: store.commonData.searchParams
  };
};

const ClassChooserContainer = ReactRedux.connect(mapStateToPropsClassChooser, mapDispatchToPropsClassChooser)(ClassChooser);

export default ClassChooserContainer;
