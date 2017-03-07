import React from 'react';
import FormElementCounter from '../_common/FormElementCounter.jsx';
import * as ReactRedux from 'react-redux';
import { actionSetCommonVal } from '../../actions.js';

let PassengerChooser = React.createClass({
  getInitialState() {
    return {
      totalMaxPassengers: 4,
      passengers: {
        adult: this.props.searchParams.passengers.adult ? parseInt(this.props.searchParams.passengers.adult) : 1,
        senior: this.props.searchParams.passengers.senior ? parseInt(this.props.searchParams.passengers.senior) : 0,
        child: this.props.searchParams.passengers.child ? parseInt(this.props.searchParams.passengers.child) : 0,
        seatInfant: this.props.searchParams.passengers.seatInfant ? parseInt(this.props.searchParams.passengers.seatInfant) : 0,
        lapInfant: this.props.searchParams.passengers.lapInfant ? parseInt(this.props.searchParams.passengers.lapInfant) : 0
      }
    }
  },

  componentDidMount() {
    this.setState({isMounted: true});
  },

  componentWillUnmount() {
    this.setState({isMounted: false});
  },

  handleFormChange(passengerType, passengerVal) {
    if (this.state.isMounted) {
      let _passengers = Object.assign({}, this.state.passengers);
      _passengers[passengerType] = passengerVal;
      this.setState({passengers: _passengers});
    }
  },

  dismissChanges: function () {
    this.props.onCancel();
  },

  getPassengersCount: function () {
      return parseInt(this.state.passengers.adult) + parseInt(this.state.passengers.senior) +
          parseInt(this.state.passengers.child) + parseInt(this.state.passengers.seatInfant) +
          parseInt(this.state.passengers.lapInfant);
  },

  btnDisabled: function() {
    let _adults = parseInt(this.state.passengers.adult) + parseInt(this.state.passengers.senior);
    let _infants = parseInt(this.state.passengers.seatInfant) + parseInt(this.state.passengers.lapInfant);
    let _children = parseInt(this.state.passengers.child);

    return (this.getPassengersCount() > this.state.totalMaxPassengers) || !(_adults > 0 || (_children > 0 && _infants == 0));
  },

  render: function () {
    return (
    <span>
      <div id="passenger-chooser-close" className="close-x" onClick={() => {this.dismissChanges()}}></div>

      <div className="wrapper">

        <FormElementCounter
          className="passenger-type"
          label="Adult"
          hint="12-64"
          value={this.state.passengers.adult}
          name="adult"
          min={0}
          onChange={(val) => this.handleFormChange('adult', val)}
        />
        <FormElementCounter
          className="passenger-type"
          label="Senior"
          hint="65+"
          value={this.state.passengers.senior}
          name="senior"
          min={0}
          onChange={(val) => this.handleFormChange('senior', val)}
        />
        <FormElementCounter
          className="passenger-type"
          label="Child"
          hint="2-11"
          value={this.state.passengers.child}
          name="child"
          min={0}
          onChange={(val) => this.handleFormChange('child', val)}
        />
        <FormElementCounter
          className="passenger-type"
          label="Seat Infant"
          hint="under 2"
          value={this.state.passengers.seatInfant}
          name="seatInfant"
          min={0}
          onChange={(val) => this.handleFormChange('seatInfant', val)}
        />
        <FormElementCounter
          className="passenger-type"
          label="Lap Infant"
          hint="under 2"
          value={this.state.passengers.lapInfant}
          name="lapInfant"
          min={0}
          onChange={(val) => this.handleFormChange('lapInfant', val)}
        />

      </div>{/* ends wrapper */}

      <div className="buttons double">
        <button id="passenger-chooser-cancel-button" type="submit" className="big-button cancel-button"
        onClick={this.dismissChanges}
        >Cancel</button>
        <button id="passenger-chooser-done-button" type="submit" className={["big-button"] + [this.btnDisabled() ? " disabled" : ""]}
        onClick={() => {this.props.applyChanges.call(this)}} disabled={this.btnDisabled() ? "disabled" : ""}
        >Done</button>
      </div>
    </span>
    )
  }
});

const mapDispatchToPropsPassengerChooser = (dispatch, ownProps) => {
  return {
    applyChanges: function () {
      if (!this.btnDisabled()) {
        let _passengers = Object.assign({}, this.state.passengers);
        dispatch(actionSetCommonVal(['searchParams', 'passengers'], _passengers));
        ownProps.onDone();
      }
    }
  }
};

const mapStateToPropsPassengerChooser = function(store) {
  return {
    searchParams: store.commonData.searchParams
  };
};

const PassengerChooserContainer = ReactRedux.connect(mapStateToPropsPassengerChooser, mapDispatchToPropsPassengerChooser)(PassengerChooser);

export default PassengerChooserContainer;

