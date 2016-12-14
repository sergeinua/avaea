
var PassengerChooser = React.createClass({

  componentWillMount: function () {
    this.updateCount(this.props.searchParams.passengers);
  },

  changePassengersCount: function() {
    this.updateCount(parseInt(this.props.searchParams.passengers) + 1);
  },

  updateCount: function(passengerVal) {
    if (!passengerVal || passengerVal > 4) {
      passengerVal = 1;
    }
    ActionsStore.setFormValue('passengers', passengerVal);
  },

  render: function () {
    var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};
    var passengers_text = this.props.searchParams.passengers == 1 ? "Adult" : "Adults";

    return (
      <div className="chooser flight-passengers-info-item row">
        <div className="label-d col-xs-6">Passengers</div>
        <div className="text-picker col-xs-6" onClick={this.changePassengersCount}>
          <span id="passengers_count">{digits[this.props.searchParams.passengers]}</span> <span className="passengers_text">{passengers_text}</span>
        </div>
      </div>
    )
  }
});
