import React from 'react';
import Select from 'react-select';
import 'whatwg-fetch';
import 'promise-polyfill';
import { clientStore } from '../../reducers.js';
import { actionSetProgramsVal } from '../../actions.js';

let UserProfilePanelFFMSelect = React.createClass({

  getInitialState: function() {
    return {
      programName: '',
      programData: [],
      statusName: '',
      tierData: [],
      tierName: ''
    }
  },

  componentWillMount: function () {
    this.setState({
      programName: this.props.elem_value || '',
      statusName: this.props.elem_value_status || '',
      tierName: this.props.elem_value_tier || ''
    })
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, this.props.elemNum, 'program_name', incObj.value))
      this.setState({
        programName: incObj.value,
        programData: this.getStatusOptions(incObj.program),
        tierData: this.getTierOptions(incObj.tier)
      })
    }
  },

  handleChangeStatusValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, this.props.elemNum, 'status', incObj.value))
      this.setState({
        statusName: incObj.value
      })
    }
  },

  handleChangeTierValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, this.props.elemNum, 'tier', incObj.value))
      this.setState({
        tierName: incObj.value
      })
    }
  },

  getSelectOptions: function(input) {
    if (input=='') {
      input = this.state.programName
    }

    return fetch('/ac/ffm_airlines?q=' + input, {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        if (this.state.programName && this.state.programName == json[0].value) {
          this.setState({
            programData: this.getStatusOptions(json[0].program),
            tierData: this.getTierOptions(json[0].tier)
          })
        }
        return {options: json}
      })
      .catch(function (error) {
        console.log(error)
      });
  },

  getStatusOptions: function(data) {
    if (!data.length) {
      return []
    }
    let res = data.map(function (item, key) {
      return {
        value: item['at'],
        label: item['atn']
      }
    })
    return res
  },

  getTierOptions: function(data) {
    if (!data.length) {
      return []
    }
    let res = data.map(function (item, key) {
      return {
        value: item['ta'],
        label: item['tn']
      }
    })
    return res
  },

  render: function () {
    return <div>
      <Select.Async
        name={this.props.elem_name}
        id={this.props.id}
        value={this.state.programName}
        className="form-control input-sm"
        placeholder="Program Name"
        loadOptions={this.getSelectOptions}
        isLoading={true}
        clearable={false}
        cache={false}
        onChange={this.handleChangeValue}
      />

      <label>Status</label>
      <Select
        name={"miles_programs.status[" + this.props.elemNum + "]"}
        id={"miles_programs.status-" + this.props.elemNum}
        value={this.state.statusName}
        className="form-control input-sm"
        placeholder="Status"
        options={this.state.programData}
        clearable={false}
        cache={false}
        onChange={this.handleChangeStatusValue}
      />

      <label>Tier</label>
      <Select
        name={"miles_programs.tier[" + this.props.elemNum + "]"}
        id={"miles_programs.tier-" + this.props.elemNum}
        value={this.state.tierName}
        className="form-control input-sm"
        placeholder="Tier"
        options={this.state.tierData}
        clearable={false}
        cache={false}
        onChange={this.handleChangeTierValue}
      />
    </div>
  }

});

export default UserProfilePanelFFMSelect;
