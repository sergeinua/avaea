var ClassChooser = React.createClass({
  getInitialState: function() {
    //FIXME get rid from jquery
    return {
      currentClass: this.props.classVal || $('#preferedClass').val(),
    };
  },

  componentWillMount: function () {
    ActionsStore.updateCurrentClass = () => {
      this.updateCurrentClass();
    }
  },

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
      if (idx == this.state.currentClass) {
        flagNext = true;
      }
    }
    this.setState({
      currentClass: newValue
    });
    //FIXME get rid from jquery
    $('#preferedClass').val(newValue);
  },
  render() {
    return (
      <div className="chooser flight-class-info-item row">
        <div className="label-d col-xs-6">Class</div>
        <div className="text-picker col-xs-6" onClick={this.changeClass}>{serviceClass[this.state.currentClass]}</div>
      </div>
    )
  }
});
