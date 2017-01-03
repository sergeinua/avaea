import React from 'react';
import * as ReactRedux from 'react-redux';
import Select from 'react-select';
import { clientStore } from '../../reducers.js';
import { actionSetPersonalVal } from '../../actions.js';
const STATES = require('../../fixtures/countryStates')

let UserProfilePanelElementState = React.createClass({
  getInitialState: function() {
    return {
      stateCode: this.props.item.data
    }
  },

  componentWillMount: function () {
    this.setState({
      stateCode: this.props.elem_value || this.props.item.data
    })
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetPersonalVal(this.props.elemNum, incObj.value))
      this.setState({
        stateCode: incObj.value
      })
    }
  },

  render: function() {
    let stateList = STATES.STATES[this.props.countryCode]
    return <div>
      <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
      <Select
        name={this.props.item.id}
        value={this.state.stateCode}
        className="form-control input-sm"
        placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title}
        options={stateList}
        clearable={false}
        cache={false}
        onChange={this.handleChangeValue}
      />
    </div>
  }
})

const mapStateProfile = function(store) {
  let countryCode = ''
  store.profileData.personal.map(function (element, index) {
    if (element.id === 'personal_info.address.country_code') {
      countryCode = element.data
    }
  })
  return {
    countryCode: countryCode
  };
};

let UserProfilePanelElementStateContainer = ReactRedux.connect(mapStateProfile, null)(UserProfilePanelElementState);

export default UserProfilePanelElementStateContainer;
