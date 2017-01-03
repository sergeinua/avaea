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
      statusName: ''
    }
  },

  componentWillMount: function () {
    this.setState({
      programName: this.props.elem_value || '',
      statusName: this.props.elem_value_status || ''
    })
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, this.props.elemNum, 'program_name', incObj.value))
      this.setState({
        programName: incObj.value,
        programData: this.getStatusOptions(incObj.program)
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
            programData: this.getStatusOptions(json[0].program)
          })
        }
        return {options: json}
      })
      .catch(function (error) {
        console.log(error)
      });
  },

  getStatusOptions: function(data) {
    if (!data.length) return []
    let res = data.map(function (item, key) {
      return {
        value: item['at'],
        label: item['atn']
      }
    })
    return res
  },

  render: function () {
    return <div>
      <Select.Async
        name={this.props.elem_name}
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
        value={this.state.statusName}
        className="form-control input-sm"
        placeholder="Status"
        options={this.state.programData}
        clearable={false}
        cache={false}
        onChange={this.handleChangeStatusValue}
      />
    </div>
  }

});

export default UserProfilePanelFFMSelect;
