import React from 'react';
import FormElementDropdownContainer from './FormElementDropdown';
import FormElementRadioContainer from './FormElementRadio'

let FormElement = React.createClass({

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {
      	
      	
        if (this.props.item.type === 'radio') {
          return <span>
          <div 
          className={['radio-holder '] + [this.props.item.id] + [this.props.item.validated ? ' has-error' : '']}>
            <label className={['radio '] + [this.props.item.required ? "required" : ""]}>{this.props.item.title}</label>
            <FormElementRadioContainer
              id={this.props.item.id}
              panelType={this.props.panelType}
              item={this.props.item }
              profileStructure={this.props.profileStructure[this.props.item.id]}
              elemNum={this.props.elemNum}
            />
            </div>
          </span>
        } else {
          return <span>
          <div 
          className={['select-holder '] + [this.props.item.id] + [this.props.item.validated ? ' has-error' : '']}>
            <label className={['select '] + [this.props.item.required ? "required" : ""]}>{this.props.item.title}</label>
            <FormElementDropdownContainer
              id={this.props.item.id}
              panelType={this.props.panelType}
              item={this.props.item }
              profileStructure={this.props.profileStructure[this.props.item.id]}
              elemNum={this.props.elemNum}
            />
            </div>
          </span>
        }
      }

    } else {

      return <span>
      <div 
      className={['text-holder '] + [this.props.item.id] + [this.props.item.validated && this.props.item.validated.length ? ' has-error' : '']}>
      
      <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
        <input
          type={this.props.item.type ? this.props.item.type : "text"}
          id={this.props.item.id}
          name={this.props.item.id}
          className={["textfield "] + [this.props.item.id]}
          placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title}
          key={`input:${this.props.item.data || this.props.item.forcedUpdate}`}
          defaultValue={this.props.item.data || this.props.item.forcedUpdate}
          required={this.props.item.required ? "required" : ""}
          onBlur={this.props.handleChangeValue}
        />
        {this.props.item.validated && this.props.item.validated.length ?
          <div className="error-message">{this.props.item.validator.errorMsg[this.props.item.validated[0]]}</div>
          : null}
      </div>
    </span>;

    }
  }

});

export default FormElement;
