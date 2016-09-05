var NotFound = React.createClass({
  render() {
    return (
      <div className="nothing-found">
          <div className="copy">
            No flights were found from <div>{this.props.departure.iata_3code}, {this.props.departure.city} to </div>{this.props.arrival.iata_3code}, {this.props.arrival.city}
          </div>
          <div className="buttons">
            <a href="/search" className="big-button new-search-button" role="button">Start new search</a>
          </div>  
      </div>
    )
  }

});
