var VoiceForm = React.createClass({
  getInitialState: function() {
    var text = 'Activate the mic to specify your from and to cities, and dates of travel';
    //FIXME get rid from jquery
    if (!$('body').hasClass('desktop')) {
      text = 'Tap the mic on your device to specify your from and to cities, and dates of travel'
    }
    return {
      placeholderText: 'search',
      voiceSearchValue: ''
    };
  },
  render() {
    return (
      <div className="voice-form">
        <div className="col-xs-12 clearfix flight-direction-item-voice-search">
          <div className="voice-search-content">
            <textarea
              name="voiceSearch"
              id="voiceSearchTextarea"
              autofocus="true"
              placeholder={this.state.placeholderText}
              value = {this.state.voiceSearchValue}
              className="voice-search-textarea si-input">
            </textarea>
            <div className="ie-fixer placeholder"></div>
          </div>
        </div>
        <div className="col-xs-12 clearfix voice-search-buttons">
          <div className="big-button disabled" id="voiceSearchFlight">Continue</div>
        </div>
      </div>
    )
  }
});
