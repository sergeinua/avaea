import React from 'react';
import * as ReactRedux from 'react-redux';
import OrderPanelElement from './OrderPanelElement.jsx';
import { actionSetOrderFieldVal } from '../../actions.js';
import moment from 'moment';

let PassengerItem = React.createClass({

  render() {
    let lapRadioStructure = {};
    let genderStructure = {};

    lapRadioStructure["passengers["+this.props.index+"].lap"] = {
      "on_lap": "On lap",
      "in_seat": "In seat"
    };

    genderStructure["passengers["+this.props.index+"].Gender"] = {M: "Male", F: "Female"};

    return (
      <div>
        <div className="which-passenger">Passenger {this.props.index}</div>

        {this.props.index == 1 ?
        <div className="its-me">
          <div className="tertiary-button" onClick={this.props.populateUserData}>It's me</div>
          <div className="hint">Tap if traveller is the person being billed</div>
        </div>:null}

        {this.props.passengerData.map(
          (item, index) => <OrderPanelElement profileStructure={genderStructure} item={item} key={'elem-' + index} panelType="fields"/>
        )}

        {/* TODO: The lap disabled because is not applied yet with any APIs */}
        { false && this.props.orderData.fieldsData
        && this.props.orderData.fieldsData['passengers['+ this.props.index +'].DateOfBirth']
        && moment().diff(this.props.orderData.fieldsData['passengers['+ this.props.index +'].DateOfBirth'], 'years') < 12 ?
          <OrderPanelElement
            item={{
              id: 'passengers[' + this.props.index + '].lap',
              required: false,
              title: 'Lap infant',
              data: ''
            }}
            profileStructure={lapRadioStructure}
            key={'elem-infant-seat' + this.props.index}
            panelType="fields"
          />:null
        }
        {this.props.index == 1 ?
          <OrderPanelElement item={{
            id: 'passengers[' + this.props.index + '].phone',
            required: true,
            title: 'Phone',
            placeholder: '+1 123 555 6789',
            data: ''
          }} key={'elem-passenger-phone'} panelType="fields"/>:null}
      </div>
    )
  }

});

const mapDispatchPassengerItem = (dispatch, ownProps) => {
  return {
    populateUserData: (event) => {
      dispatch(actionSetOrderFieldVal('passengers[1].FirstName', ownProps.orderData.fieldsData.FirstName));
      dispatch(actionSetOrderFieldVal('passengers[1].LastName', ownProps.orderData.fieldsData.LastName));
      dispatch(actionSetOrderFieldVal('passengers[1].Gender', ownProps.orderData.fieldsData.Gender));
      dispatch(actionSetOrderFieldVal('passengers[1].DateOfBirth', ownProps.orderData.fieldsData.DateOfBirth));
    },
  }
};

const mapStateOrder = function(store) {
  return {
    orderData: store.orderData
  };
};

const PassengerItemContainer = ReactRedux.connect(mapStateOrder, mapDispatchPassengerItem)(PassengerItem);

export default PassengerItemContainer;
