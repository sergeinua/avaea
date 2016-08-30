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
      <nav id="tiles_ui" className="navbar navbar-default navbar-fixed-top container-fluid">
        <div className="flight-info row hide">
          <div className="col-xs-12 result-search-info-bar">
            <div style={{float: 'left', width: 'auto'}}>
              <span className="requested-airports">{ this.state.title }</span>
              <span className="text-spacer"></span>
              <span className="flight-date">{ this.state.searchParams.departureDate + (this.state.searchParams.returnDate?'–'+this.state.searchParams.returnDate:'') }
              <span className="text-spacer"></span>
                { this.state.searchParams.CabinClass }
                <span className="flight-type">{ this.flightTypeName[this.state.searchParams.flightType] }</span>
                <span className="text-spacer"></span>
                <span className="passengers_count">{ this.state.searchParams.passengers }</span>
                <span id="user-icon-small" className="glyphicon glyphicon-user"></span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    )
  }
});

