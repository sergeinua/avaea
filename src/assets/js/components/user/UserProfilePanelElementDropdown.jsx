var UserProfilePanelElementDropdown = React.createClass({

  render: function () {

    var self = this,
      _nodes = [], _options = [];

    if ($.isArray(this.props.profileStructure)) {

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

    return <select name={this.props.item.id} className="form-control input-sm" defaultValue={self.props.item.data}>
      <option value="">---</option>
      { _nodes }
    </select>

  }

});
