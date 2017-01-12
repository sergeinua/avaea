import React from 'react';
import UserProfilePanelAirlineSelect from './UserProfilePanelAirlineSelect.jsx';
import UserProfilePanelFFMSelect from './UserProfilePanelFFMSelect';
import { clientStore } from '../../reducers.js';
import { actionSetProgramsVal } from '../../actions.js';

let UserProfilePanelBlockPrograms = React.createClass({

  getInitialState: function() {
    return {item: {}};
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state;

    state.item = nextProps.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.miles_programs);
    }
    this.setState(state);
  },

  componentWillMount: function() {
    var state = this.state;

    state.item = this.props.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.miles_programs);
    }
    this.setState(state);
  },

  handleChangeValue: function (event, elemNum, fieldName) {
    clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, elemNum, fieldName, event.target.value));
  },

  render: function() {

    var self = this;

    return <fieldset className="fieldset" key={'miles_programs'}>
      <div className="panel-body">
        {
          this.state.item.data.map(function (item, index) {

            return <div id={"miles_programs" + index} data-fieldset-name="miles_programs" key={'miles_programs' + item.program_name + index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Program Name</label>
              <span className={"remove-fieldset " + (self.state.item.data.length > 1 ? "" : "hide")}
                    data-fieldset="miles_programs" onClick={self.props.onRemoveFieldset} >remove</span>
              <UserProfilePanelFFMSelect
                elem_name={"miles_programs.program_name["+index+"]"}
                id={"miles_programs.airline_name-" + index}
                elem_value={item.program_name}
                blockNum={self.props.blockNum}
                elemNum={index}
                elem_value_tier={item.tier}
              />

              <label>Program Number</label>
              <input id={"miles_programs.account_number-" + index} type="text" name="miles_programs.account_number[]" className="form-control input-sm" placeholder="Account Number" defaultValue={item.account_number}
                     onBlur={(event) => self.handleChangeValue(event, index, 'account_number')}/>

            </div>
          })
        }
      </div>

      <div className="panel-footer">
        <button id="miles-programs-one-more-button" type="button" data-for="miles_programs" onClick={this.props.onAddOneMore}>Add more</button>
      </div>

    </fieldset>;
  }

});

export default UserProfilePanelBlockPrograms;
