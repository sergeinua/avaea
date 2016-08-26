var NotFound = React.createClass({
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12 nothing-found">
            <div className="nothing-found-icon"></div>
            <div className="nothing-found-text">No results were found from {this.props.departure.iata_3code}, {this.props.departure.city} to {this.props.arrival.iata_3code}, {this.props.arrival.city}.</div>
          </div>
        </div>
        <a href="/search"  className="btn btn-sm btn-primary btn-block center-block new-search-button" role="button">Start new search</a>
      </div>
    )
  }

});
