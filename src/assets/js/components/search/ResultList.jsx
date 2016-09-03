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
      <div id="searchResultData" className="flights">
        {this.state.searchResult.map(function(itinerary) {
          if (!itinerary.is_hidden) {
            return <ResultItem key={itinerary.id} itinerary={itinerary}/>
          }
          return ''
        })}
      </div>
        : ''
      )}
      </span>
    )
  }
});
