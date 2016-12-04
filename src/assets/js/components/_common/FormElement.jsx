var FormElement = React.createClass({

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {

        return <div>
          <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
          <UserProfilePanelElementDropdown
            panelType={this.props.panelType}
            item={this.props.item }
            profileStructure={this.props.profileStructure[this.props.item.id]}
            elemNum={this.props.elemNum}
          />
        </div>
      }

    } else {

      return <div>
        <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
        <input
          type={this.props.item.type ? this.props.item.type : "text"}
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
