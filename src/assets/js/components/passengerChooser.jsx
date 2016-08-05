
class PassengerChooser extends React.Component {
  render() {
    var digits = {1:"One", 2:"Two", 3:"Three", 4:"Four"};
    var passengers_text = (this.props.passengerVal > 1 && this.props.passengerVal < 5)?'adults':'adult';
    return (
      <div className="flight-passengers-info-item row">
        <div className="text-label col-xs-6">passengers</div>
        <div className="text-picker col-xs-6">
          <span id="passengers_count">{digits[this.props.passengerVal]||'One'}</span> <span className="passengers_text">{passengers_text}</span>
        </div>
      </div>
    )
  }
}

function renderPassengerChooser(passengerVal) {
  if ($('#PassengerChooser').length) {
    ReactContentRenderer.render(<PassengerChooser passengerVal={passengerVal}/>, $('#PassengerChooser'));
  }
}

$(document).ready(function() {
  renderPassengerChooser(1);
});
