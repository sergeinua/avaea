
var ClassChooser = React.createClass({

  changeClass: function() {
    this.updateCurrentClass();
  },

  updateCurrentClass: function() {
    var flagNext = false;
    var newValue = 'E';

    for(var idx in serviceClass) {
      if (flagNext) {
        newValue = idx;
        break;
      }
      if (idx == this.props.searchParams.CabinClass) {
        flagNext = true;
      }
    }
    ActionsStore.setFormValue('CabinClass', newValue);
  },

  render() {
    return (
      <div className="chooser flight-class-info-item row">
        <div className="label-d col-xs-6">Class</div>
        <div className="text-picker col-xs-6" onClick={this.changeClass}>{serviceClass[this.props.searchParams.CabinClass]}</div>
      </div>
    )
  }
});
