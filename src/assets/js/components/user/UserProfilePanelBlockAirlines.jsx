import React from 'react';
import UserProfilePanelAirlineSelect from './UserProfilePanelAirlineSelect.jsx';
import FormElementDropdownContainer from '../_common/FormElementDropdown.jsx';

let UserProfilePanelBlockAirlines = React.createClass({

  getInitialState: function() {
    return {item: {}};
  },

  componentWillReceiveProps: function(nextProps) {
    var state = this.state;

    state.item = nextProps.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.preferred_airlines);
    }
    this.setState(state);
  },

  componentWillMount: function() {
    var state = this.state;

    state.item = this.props.item;
    if (!state.item.data.length) {
      state.item.data.push(this.props.programsStructure.preferred_airlines);
    }
    this.setState(state);
  },

  render: function() {

    var self = this;

    return <fieldset className="fieldset" key={'preferred_airlines'}>
      <legend className="legend">{this.state.item.title}</legend>
      <div className="panel-body">
        {
          this.state.item.data.map(function(item, index) {
            var pseudoItem = {id: 'travel_type', data: item.travel_type};

            return <div id="preferred_airlines" data-fieldset-name="preferred_airlines" key={'preferred_airlines' + item.airline_name + index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Preferred Airlines type</label>
              <span className={"remove-fieldset " + (self.state.item.data.length > 1 ? "" : "hide")}
                     data-fieldset="preferred_airlines" onClick={self.props.onRemoveFieldset} >remove</span>
              <FormElementDropdownContainer
                panelType="programs"
                item={pseudoItem}
                profileStructure={self.props.programsStructure.travel_type}
                blockNum={self.props.blockNum}
                elemNum={index}
              />

              <label>Airline Name</label>
              <UserProfilePanelAirlineSelect
                elem_name={"preferred_airlines.airline_name["+index+"]"}
                elem_value={item.airline_name}
                blockNum={self.props.blockNum}
                elemNum={index}
              />

            </div>

          })
        }
      </div>

      <div className="panel-footer">
        <button type="button" data-for="preferred_airlines" onClick={this.props.onAddOneMore}>One more</button>
      </div>

    </fieldset>;
  }

});

export default UserProfilePanelBlockAirlines;
