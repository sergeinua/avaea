import React from 'react';
import ResultItemContainer from './ResultItem.jsx';
import Iframe from 'react-iframe';

let ResultList = React.createClass({
  render: function() {
    return (
      <span>
      {(this.props.InitResultData.searchResultLength ?
      <div id="searchResultData" className="flights">
        {this.props.InitResultData.searchResult.map(function(itinerary, counter) {
          if (!itinerary.is_hidden) {
            let result = null;
            if (counter == 2) {
              result = <span key="ad">
                <div className="col-xs-12 itinerary">
                  <Iframe id="c7aed39b" name="mc79eba9" url="/static/adds.html"
                    frameborder="0" scrolling="no" width="100%" height="100%" position="relative"></Iframe>
                </div>
                <ResultItemContainer key={itinerary.id}
                                     itinerary={itinerary} />
              </span>;
              return result;
            } else {
              return <ResultItemContainer key={itinerary.id}
                                          itinerary={itinerary}/>;
            }
          }
          return null;
        }.bind(this))}
      </div>
        : null
      )}
      </span>
    )
  }
});

export default ResultList;
