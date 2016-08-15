var SearchResult = {};
// $.getScript("js/components/sorter.js");
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
              <span className="flight-date">{ this.state.searchParams.departureDate }&ndash;{ this.state.searchParams.returnDate }
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
        <Buckets tiles={this.state.tiles}/>
        <div className="bottomNav">

          <span>Showing <span className='search_count'><span id='search_count'>{ this.state.searchResultLength }</span>/{this.props.InitResultData.searchResultLength} </span></span>
          Flights by <Sorter/>
          <div className="clear-undo-buttons text-right">
            <span id="clear" className="clear-all-filters disabled">Clear</span>|
            <span id="undo" className="undo-button disabled">Undo</span>
          </div>
        </div>

      </nav>




    )
  }
});

function renderNavBar(InitResultData) {
  if ($('#navbar').length) {
    ReactContentRenderer.render(<NavBar InitResultData = {InitResultData}/>, $('#navbar'));
  }
}

$(document).ready(function() {
  if (typeof InitResultData != 'undefined') {
    renderNavBar(InitResultData);
  }
});
