var UserProfilePanelElement = React.createClass({

  handleChangeValue: function (event) {
    clientStore.dispatch(actionSetPersonalVal(this.props.elemNum, event.target.value));
  },

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {

        return <div>
          <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
          <UserProfilePanelElementDropdown
            panelType="personal"
            item={this.props.item }
            profileStructure={this.props.profileStructure[this.props.item.id]}
            elemNum={this.props.elemNum}
          />
        </div>
      }

    } else {

      if (this.props.item.required) {
        return <div>
          <label className="required">{this.props.item.title}</label>
          <input required type={this.props.item.type ? this.props.item.type : "text"} name={this.props.item.id} className="form-control input-sm"
                 placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title} defaultValue={this.props.item.data}
                 onBlur={this.handleChangeValue}
          />
        </div>;

      } else {
        return <div>
          <label>{this.props.item.title}</label>
          <input type={this.props.item.type ? this.props.item.type : "text"} name={this.props.item.id} className="form-control input-sm"
                 placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title} defaultValue={this.props.item.data}
                 onBlur={this.handleChangeValue}
          />
        </div>;

      }

    }
  }

});
