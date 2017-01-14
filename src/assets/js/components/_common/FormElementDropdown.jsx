import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetProgramsVal, actionSetPersonalVal, actionSetOrderFieldVal } from '../../actions.js';

class FormElementDropdown extends React.Component {

  render() {

    var self = this,
      _nodes = [], _options = [];

    if (Array.isArray(this.props.profileStructure)) {

      this.props.profileStructure.forEach(function(key) {
        _options.push({key: key, data: key});
      })

    } else {

      var _keys = Object.keys(this.props.profileStructure);
      _keys.forEach(function(key) {
        _options.push({key: key, data: self.props.profileStructure[key]});
      })

    }

    _options.map(function(option, index) {
      _nodes.push(<option key={index} value={option.key}>{option.data}</option>);
    });

    return <select
      name={this.props.item.id}
      className="form-control input-sm"
      defaultValue={self.props.item.data}
      onChange={this.props.handleChangeValue}
    >
      <option value="">---</option>
      { _nodes }
    </select>

  }

}

const mapDispatchElemDropdown = (dispatch, ownProps) => {
  return {
    handleChangeValue: (event) => {
      if (ownProps.panelType == 'programs') {
        dispatch(actionSetProgramsVal(ownProps.blockNum, ownProps.elemNum, ownProps.item.id, event.target.value));
      }
      else if (ownProps.panelType == 'personal') {
        dispatch(actionSetPersonalVal(ownProps.elemNum, event.target.value));
      }
      else if (ownProps.panelType == 'fields') {
        dispatch(actionSetOrderFieldVal(event.target.name, event.target.value));
      }
      else {
        console.error('Unknown panelType prop:', ownProps.panelType);
      }
    },
  }
};

let FormElementDropdownContainer = ReactRedux.connect(null, mapDispatchElemDropdown)(FormElementDropdown);

export default FormElementDropdownContainer;
