import React from 'react';
import * as ReactRedux from 'react-redux';
import { actionSetProgramsVal, actionSetPersonalVal, actionSetOrderFieldVal } from '../../actions.js';

class FormElementRadio extends React.Component {

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
      _nodes.push(
        <label key={index} className="">
          <input type="radio" name={self.props.item.id}
                 id={self.props.id}
                 value={option.key} onChange={self.props.handleChangeValue}
                 checked={(self.props.item.data === option.key)}
          />{option.data}
        </label>
      );
    });

    return  <div className='radio-buttons-block'>{_nodes}</div>

  }

}

const mapDispatchElemRadio = (dispatch, ownProps) => {
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

let FormElementRadioContainer = ReactRedux.connect(null, mapDispatchElemRadio)(FormElementRadio);

export default FormElementRadioContainer;
