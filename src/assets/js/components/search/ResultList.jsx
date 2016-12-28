import React from 'react';
import ResultItem from './ResultItem.jsx';

var ResultList = React.createClass({

  render: function() {
    return (
      <span>
      {(this.props.InitResultData.searchResultLength ?
      <div id="searchResultData" className="flights">
        {this.props.InitResultData.searchResult.map(function(itinerary) {
          if (!itinerary.is_hidden) {
            return <ResultItem key={itinerary.id} itinerary={itinerary}/>
          }
          return null;
        })}
      </div>
        : null
      )}
      </span>
    )
  }
});

export default ResultList;
