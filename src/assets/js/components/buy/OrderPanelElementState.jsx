import React from 'react';
import * as ReactRedux from 'react-redux';
import Select from 'react-select';
import { clientStore } from '../../reducers.js';
import { actionSetOrderFieldVal } from '../../actions.js';
const STATES = require('../../fixtures/countryStates');

let OrderPanelElementState = React.createClass({
  getInitialState: function() {
    return {
      stateCode: this.props.item.data
    }
  },

  componentWillMount: function () {
    let stateVal = this.props.elem_value || this.props.item.data;
    if (STATES[stateVal]) {
      this.setState({
        stateCode: stateVal
      });
    } else {
      clientStore.dispatch(actionSetOrderFieldVal(this.props.item.id, ''));
      this.setState({
        stateCode: ''
      });
    }
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetOrderFieldVal(this.props.item.id, incObj.value));
      this.setState({
        stateCode: incObj.value
      })
    }
  },

  render: function() {
    let stateList = STATES.STATES[this.props.countryCode];
    return <div>
      <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
      <Select
        name={this.props.item.id}
        id={'profilePersonal-' + this.props.item.id}
        value={this.state.stateCode}
        className="form-control input-sm profile-state"
        placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title}
        options={stateList}
        clearable={false}
        cache={false}
        onChange={this.handleChangeValue}
      />
    </div>
  }
});

const mapStateOrder = function(store) {
  return {
    countryCode: store.orderData.fieldsData['Country'] || ''
  };
};

let OrderPanelElementStateContainer = ReactRedux.connect(mapStateOrder, null)(OrderPanelElementState);

export default OrderPanelElementStateContainer;
