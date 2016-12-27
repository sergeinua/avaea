import React from 'react';
import UserProfilePanelAirlineSelect from './UserProfilePanelAirlineSelect.jsx';
import { clientStore } from '../../reducers.js';
import { actionSetProgramsVal } from '../../actions.js';

let UserProfilePanelBlockMembership = React.createClass({

  getInitialState: function() {
    return {item: {}};
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state;

    state.item = nextProps.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.lounge_membership);
    }
    this.setState(state);
  },

  componentWillMount: function() {
    var state = this.state;

    state.item = this.props.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.lounge_membership);
    }
    this.setState(state);
  },

  handleChangeValue: function (event, elemNum, fieldName) {
    clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, elemNum, fieldName, event.target.value));
  },

  render: function() {

    var self = this;

    return <fieldset className="fieldset" key={'lounge_membership'}>
      <legend className="legend">{this.state.item.title}</legend>
      <div className="panel-body">
        {
          this.state.item.data.map(function (item, index) {

            return <div id="lounge_membership" data-fieldset-name="lounge_membership" key={'lounge_membership' + item.airline_name + index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Airline Name</label>
              <span className={"remove-fieldset " + (self.state.item.data.length > 1 ? "" : "hide")}
                    data-fieldset="lounge_membership" onClick={self.props.onRemoveFieldset} >remove</span>
              <UserProfilePanelAirlineSelect
                elem_name={"lounge_membership.airline_name["+index+"]"}
                elem_value={item.airline_name}
                blockNum={self.props.blockNum}
                elemNum={index}
              />


              <label>Club Membership Number</label>
              <input type="text" name="lounge_membership.membership_number[]" className="form-control input-sm" placeholder="Club Membership Number" defaultValue={item.membership_number}
                     onBlur={(event) => self.handleChangeValue(event, index, 'membership_number')}/>

              <label>Expiration Date</label>
              <input type="date" name="lounge_membership.expiration_date[]" className="form-control input-sm" defaultValue={item.expiration_date}
                     onBlur={(event) => self.handleChangeValue(event, index, 'expiration_date')}/>

            </div>
          })
        }
      </div>

      <div className="panel-footer">
        <button type="button" data-for="lounge_membership" onClick={this.props.onAddOneMore}>One more</button>
      </div>

    </fieldset>;
  }

});

export default UserProfilePanelBlockMembership;
