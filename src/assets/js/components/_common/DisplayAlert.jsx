import React from 'react';
import { Link } from 'react-router';

let DisplayAlert = React.createClass({
  render() {
    return (
      <div className="nothing-found">
          <div className="copy">
            {this.props.errorInfo.messages.map((message, index) => <div key={'msg_'+index}>{message}</div>)}
          </div>
          <div className="buttons">
            <Link to={this.props.tryUrl} className="big-button new-search-button" role="button">Try Again</Link>
          </div>
      </div>
    )
  }
});

DisplayAlert.defaultProps = {
  errorInfo: {
    type: 'Error.Search.Generic',
    messages: ["Your request cannot be processed", "at the moment due to technical problems.", "Please try again later"]
  },
  tryUrl: "/search"
};

export default DisplayAlert;
