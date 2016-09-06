var SearchResult = {};

var NavBar = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.InitResultData.title,
      tiles: this.props.InitResultData.tiles,
      searchParams: this.props.InitResultData.searchParams,
      searchResultLength: this.props.InitResultData.searchResultLength,
    };
  },

  flightTypeName: {
    ROUND_TRIP: 'Round trip',
    ONE_WAY: 'One way',
  },

  componentWillMount: function () {
    SearchResult.searchResultLength = (newCount) => {
      this.setState({
        searchResultLength: newCount
      });
    }
  },

  render: function() {
    return (
      <nav id="tiles_ui" className="tiles-ui">
        <div className="flight-info hide">
          <div className="result-search-info-bar">
            <span className="requested-airports">{ this.state.title }</span>
            <span className="flight-date">
            	{ this.state.searchParams.departureDate + (this.state.searchParams.returnDate?'-'+this.state.searchParams.returnDate:'') }
            </span>
            <span className="seating-class">
              { this.state.searchParams.CabinClass }
            </span>  
            <span className="flight-type">{ this.flightTypeName[this.state.searchParams.flightType] }</span>
            <span className="passenger-count">{ this.state.searchParams.passengers }</span>
          </div>
        </div>
      </nav>
    )
  }
});

