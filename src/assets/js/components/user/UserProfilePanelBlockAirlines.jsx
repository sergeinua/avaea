import React from 'react';
import UserProfilePanelAirlineSelect from './UserProfilePanelAirlineSelect.jsx';
import UserProfilePanelAirlineRadio from './UserProfilePanelAirlineRadio'

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

    return <div key={'preferred_airlines'}>
        {
          this.state.item.data.map(function(item, index) {
            var pseudoItem = {id: 'travel_type', data: item.travel_type};

            return <div id={"preferred_airlines" + index} data-fieldset-name="preferred_airlines" key={'preferred_airlines' + item.airline_name + index}>
              <hr className={index == 0 ? "hidden" : ""} />

              <label>Type</label>
              <span className={"remove-fieldset " + (self.state.item.data.length > 1 ? "" : "hide")}
                     data-fieldset="preferred_airlines" onClick={self.props.onRemoveFieldset} >remove</span>
              <UserProfilePanelAirlineRadio
                id={"preferred_airlines-" + index}
                panelType="programs"
                item={pseudoItem}
                profileStructure={self.props.programsStructure.travel_type}
                blockNum={self.props.blockNum}
                elemNum={index}
              />

              <label>Airline Name</label>
              <UserProfilePanelAirlineSelect
                id={"preferred_airlines.airline_name-" + index}
                elem_name={"preferred_airlines.airline_name["+index+"]"}
                elem_value={item.airline_name}
                blockNum={self.props.blockNum}
                elemNum={index}
              />

            </div>

          })
        }
        <div className="panel-footer" style={{marginTop: '20px'}}>
          <button id="preferred-airlines-one-more-button" type="button" data-for="preferred_airlines" onClick={this.props.onAddOneMore}>Add more</button>
        </div>
      </div>;
  }

});

export default UserProfilePanelBlockAirlines;
