
var UserProfilePanelAirlineSelect = React.createClass({

  getInitialState: function() {
    return {airlineName: ''};
  },

  componentWillMount: function () {
    this.setState({airlineName: this.props.elem_value});
  },

  handleChange: function(incObj) {
    if (incObj) {
      this.setState({airlineName: incObj.value}); // Need to setup result value by self
    }
  },

  getSelectOptions: function(input) {
    if (input=='') {
      input = this.state.airlineName;
    }

    return fetch('/ac/airlines?q='+input, {
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return {options: json};
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  render: function () {
    return <Select.Async
      name={this.props.elem_name} value={this.state.airlineName} className="form-control input-sm" placeholder="Airline Name"
      loadOptions={this.getSelectOptions}
      isLoading={true}
      onChange={this.handleChange}
      clearable={false}
    />
  }

});
