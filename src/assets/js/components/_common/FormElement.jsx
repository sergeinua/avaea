import React from 'react';
import FormElementDropdownContainer from './FormElementDropdown';
import FormElementRadioContainer from './FormElementRadio'

let FormElement = React.createClass({

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {

        if (this.props.item.type === 'radio') {
          return <FormElementRadioContainer
            id={this.props.item.id}
            panelType={this.props.panelType}
            item={this.props.item }
            profileStructure={this.props.profileStructure[this.props.item.id]}
            elemNum={this.props.elemNum}
          />
        } else {
          return <div>
            <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
            <FormElementDropdownContainer
              id={this.props.item.id}
              panelType={this.props.panelType}
              item={this.props.item }
              profileStructure={this.props.profileStructure[this.props.item.id]}
              elemNum={this.props.elemNum}
            />
          </div>
        }
      }

    } else {

      return <div>
        <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
        <input
          type={this.props.item.type ? this.props.item.type : "text"}
          id={this.props.item.id}
          name={this.props.item.id}
          className="form-control input-sm"
          placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title}
          defaultValue={this.props.item.data}
          onBlur={this.props.handleChangeValue}
        />
      </div>;

    }
  }

});

export default FormElement;
