import React from 'react';
import Select from 'react-select';
import { clientStore } from '../../reducers.js';
import { actionSetPersonalVal } from '../../actions.js';
const COUNTRIES = require('../../fixtures/countries')

let UserProfilePanelElementCountry = React.createClass({
  getInitialState: function() {
    return {
      countryCode: this.props.item.data,
      countryList: []
    }
  },

  componentWillMount: function () {
    this.setState({
      countryCode: this.props.elem_value || this.props.item.data,
      countryList: COUNTRIES.COUNTRIES
    })
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetPersonalVal(this.props.elemNum, incObj.value))
      this.setState({
        countryCode: incObj.value
      })
    }
  },

  render: function() {
    return <div>
      <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
      <Select
        name={this.props.item.id}
        value={this.state.countryCode}
        className="form-control input-sm"
        placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title}
        options={this.state.countryList}
        clearable={false}
        cache={false}
        onChange={this.handleChangeValue}
      />
    </div>
  }
})

export default UserProfilePanelElementCountry;
