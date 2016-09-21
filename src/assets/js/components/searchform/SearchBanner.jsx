var SearchBanner = React.createClass({
  render() {
    return (
      <div id="searchBanner" className="modal fade searchingModal" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="copy">
                We are searching best priced flights and constructing smart filters to help you select your perfect flight.
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
