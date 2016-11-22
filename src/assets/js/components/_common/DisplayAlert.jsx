var DisplayAlert = React.createClass({
  render() {
    var user_messages;
    if (this.props.errorType == 'no_flights') {
      user_messages = ['No flights are available for selected itinerary.','Please try different dates or airports'];
    }
    else if (this.props.errorType == 'search_expired') {
      user_messages = ['Your search has expired.', 'Try a new search.'];
    }
    else if (this.props.errorType == 'no_booking') {
      user_messages = ['Could not find your booked ticket'];
    }
    else {
      user_messages = ['Your request cannot be processed', 'at the moment due to technical problems.', 'Please try again later'];
    }

    return (
      <div className="nothing-found">
          <div className="copy">
            {user_messages.map((message, index) => <div key={'msg_'+index}>{message}</div>)}
          </div>
          <div className="buttons">
            <a href={this.props.tryUrl ? this.props.tryUrl : "/search"} className="big-button new-search-button" role="button">Try Again</a>
          </div>  
      </div>
    )
  }

});
