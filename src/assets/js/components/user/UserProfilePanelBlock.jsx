import React from 'react';
import ClientApi from '../_common/api.js';
import UserProfilePanelBlockAirlines from './UserProfilePanelBlockAirlines.jsx';
import UserProfilePanelBlockPrograms from './UserProfilePanelBlockPrograms.jsx';
import UserProfilePanelBlockMembership from './UserProfilePanelBlockMembership.jsx';

let UserProfilePanelBlock = React.createClass({

  getInitialState: function() {
    return {item: this.props.item};
  },

  onAddOneMore: function(event) {

    var state = this.state,
      fieldset = $(event.target).attr('data-for');

    state.item.data.push(this.props.programsStructure[fieldset]);
    this.setState(state);
  },

  onRemoveFieldset: function(event) {

    var state = this.state,
        fieldset = $(event.target).attr('data-fieldset'),
        iterator = $('*[data-fieldset-name=' + fieldset + ']' ).index( $(event.target).parents('*[data-fieldset-name=' + fieldset + ']'));

    state.item.data.splice(iterator, 1);
    this.setState(state);

    ClientApi.reqPost("/user/removeFieldSet", {fieldset: fieldset, iterator: iterator});
  },

  render: function() {

    if (this.props.item.id == 'preferred_airlines') {

      return <UserProfilePanelBlockAirlines item={this.state.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset} blockNum={this.props.blockNum}/>;

    } else if (this.props.item.id == 'miles_programs') {

      return <UserProfilePanelBlockPrograms item={this.state.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset} blockNum={this.props.blockNum}/>;

    } else if (this.props.item.id == 'lounge_membership') {

      return <UserProfilePanelBlockMembership item={this.state.item} programsStructure={this.props.programsStructure}
        onAddOneMore={this.onAddOneMore} onRemoveFieldset={this.onRemoveFieldset} blockNum={this.props.blockNum}/>;

    } else {

      return null;

    }

  }

});

export default UserProfilePanelBlock;
