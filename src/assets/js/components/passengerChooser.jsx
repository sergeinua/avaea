
var PassengerChooser = React.createClass({
  getInitialState: function() {
    return {
      passengers_count: this.props.passengerVal || $('#passengers').val(),
      passengers_text: "adult" + (this.props.passengerVal == 1? '':'s')
    };
  },

  componentWillMount: function () {
    SearchForm.updatePassengers = (newCount) => {
      this.updateCount(newCount);
    }
  },

  changePassengersCount: function() {
    this.updateCount(this.state.passengers_count + 1);
  },

  updateCount: function(passengerVal) {
    if (passengerVal == 1 || passengerVal > 4) {
      this.setState({
        passengers_count: 1,
        passengers_text: "adult"
      });
    } else {
      this.setState({
        passengers_count: passengerVal,
        passengers_text: "adults"
      });
    }
    $('#passengers').val(passengerVal);
  },

  render: function() {
    var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};

    return (
      <div className="flight-passengers-info-item row">
        <div className="text-label col-xs-6">passengers</div>
        <div className="text-picker col-xs-6" onClick={this.changePassengersCount}>
          <span id="passengers_count">{digits[this.state.passengers_count]}</span> <span className="passengers_text">{this.state.passengers_text}</span>
        </div>
      </div>
    )
  }
});

function renderPassengerChooser(passengerVal) {
  if ($('#PassengerChooser').length) {
    ReactContentRenderer.render(<PassengerChooser passengerVal={passengerVal}/>, $('#PassengerChooser'));
  }
}

$(document).ready(function() {
  renderPassengerChooser(1);
});
