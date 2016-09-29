var UserProfilePanelElement = React.createClass({

  render: function() {

    if (this.props.profileStructure && this.props.profileStructure[this.props.item.id]) {

      if ($.isArray(this.props.profileStructure[this.props.item.id]) || $.isPlainObject(this.props.profileStructure[this.props.item.id])) {

        return <div>
          <label className={this.props.item.required ? "required" : ""}>{this.props.item.title}</label>
          <UserProfilePanelElementDropdown item={this.props.item } profileStructure={this.props.profileStructure[this.props.item.id]}/>
        </div>
      }

    } else {

      if (this.props.item.required) {
        return <div>
          <label className="required">{this.props.item.title}</label>
          <input required type={this.props.item.type ? this.props.item.type : "text"} name={this.props.item.id} className="form-control input-sm"
                 placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title} defaultValue={this.props.item.data} />
        </div>;

      } else {
        return <div>
          <label>{this.props.item.title}</label>
          <input type={this.props.item.type ? this.props.item.type : "text"} name={this.props.item.id} className="form-control input-sm"
                 placeholder={this.props.item.placeholder ? this.props.item.placeholder : this.props.item.title} defaultValue={this.props.item.data} />
        </div>;

      }

    }
  }

});
