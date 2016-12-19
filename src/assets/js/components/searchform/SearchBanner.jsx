import React from 'react';

var SearchBanner = React.createClass({
  render() {
    return (
      <div id={this.props.id} className="modal fade searchingModal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="copy">
                {this.props.text}
              </div>
              <div className="spinner-holder">
                <div className="icon-spinner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

SearchBanner.defaultProps = {
  id: 'searchBanner',
  text: 'We are searching best priced flights and constructing smart filters to help you select your perfect flight.'
};

export default SearchBanner;
