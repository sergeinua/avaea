
var UserProfilePanelAirlineSelect = React.createClass({

  getInitialState: function() {
    return {airlineName: ''};
  },

  componentWillMount: function () {
    this.setState({airlineName: this.props.elem_value});
  },

  handleChangeValue: function (incObj) {
    if (incObj) {
      clientStore.dispatch(actionSetProgramsVal(this.props.blockNum, this.props.elemNum, 'airline_name', incObj.value));
      this.setState({airlineName: incObj.value}); // Need to setup result value by self
    }
  },

  getSelectOptions: function(input) {
    if (input=='') {
      input = this.state.airlineName;
    }

    return fetch('/ac/airlines?q='+input, {
      method: 'POST',
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log('_airlines:'+ JSON.stringify(json));
        return {options: json};
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  render: function () {
    // @TODO Turn on caching. Now if caching is on then after airline removing we loose airline values in remain fields
    return <Select.Async
      name={this.props.elem_name} value={this.state.airlineName} className="form-control input-sm" placeholder="Airline Name"
      loadOptions={this.getSelectOptions}
      isLoading={true}
      clearable={false}
      cache={false}
      onChange={this.handleChangeValue}
    />
  }

});
