var ResultList = React.createClass({
  getInitialState: function() {
    return {
      searchParams: this.props.InitResultData.searchParams,
      searchResultLength: this.props.InitResultData.searchResultLength,
      searchResult: this.props.InitResultData.searchResult
    };
  },
  render: function() {
    return (
      <span>
      {(this.props.InitResultData.searchResultLength ?
      <div id="searchResultData">
        {this.state.searchResult.map(function(itinerary) {
          return <ResultItem key={itinerary.id} itinerary={itinerary}/>
        })}
      </div>
        : ''
      )}
      </span>
    )
  }
});
