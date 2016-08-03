class PassengerChooser extends React.Component {
  render() {
    return (
      <div className="flight-passengers-info-item row">
        <div className="text-label col-xs-6">passengers</div>
        <div className="text-picker col-xs-6">
          <span className="passengers_count">{this.props.passengerVal||'One'}</span> <span className="passengers_text">adult</span>
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
  renderPassengerChooser('One');
});
