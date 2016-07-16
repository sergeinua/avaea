class ClassChooser extends React.Component {
  render() {
    return (
      <div className="flight-class-info-item row">
        <div className="text-label col-xs-6">class</div>
        <div className="text-picker col-xs-6">{serviceClass[this.props.classVal]}</div>
      </div>
    )
  }
}

function renderClassChooser(classVal) {
  if ($('#ClassChooser').length) {
    ReactContentRenderer.render(<ClassChooser classVal={classVal}/>, $('#ClassChooser'));
  }
}

$(document).ready(function() {
  renderClassChooser('E');
});
