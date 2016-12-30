import React from 'react';
import { clientStore } from '../../reducers.js';
import { actionSetPreferredAirlinesVal } from '../../actions.js';

let UserProfilePanelAirlineRadio = React.createClass({
  getInitialState: function() {
    return {checked: ''}
  },

  componentWillMount: function() {
    var state = this.state;

    if (!this.props.item.data) {
      var _keys = Object.keys(this.props.profileStructure)
      state.checked = _keys[0]
    } else {
      state.checked = this.props.item.data
    }
    this.setState(state);
  },

  handleChangeValue: function (incObj) {
    var state = this.state
    if (incObj) {
      clientStore.dispatch(actionSetPreferredAirlinesVal(this.props.blockNum, this.props.elemNum, this.props.item.id, incObj.target.value))
      state.checked = incObj.target.value
      this.setState(state)
    }
  },

  render: function() {

    var self = this,
      _nodes = [], _options = [];

    if (Array.isArray(this.props.profileStructure)) {
      this.props.profileStructure.forEach(function(key) {
        _options.push({key: key, data: key});
      })
    } else {
      var _keys = Object.keys(this.props.profileStructure);
      _keys.forEach(function(item) {
        _options.push({key: item, data: item});
      })

    }

    _options.map(function(option, index) {
      _nodes.push(
        <label key={index} className="btn-block">
          <input type="radio" name={self.props.item.id + '[' + self.props.elemNum + ']'}
                 value={option.key} onChange={self.handleChangeValue}
                 checked={(self.state.checked === option.key)}
          />{option.data}
        </label>
      );
    });

    return  <div>{_nodes}</div>
  }

})

export default UserProfilePanelAirlineRadio;
