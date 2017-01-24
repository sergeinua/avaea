import React from 'react';
import ResultItemContainer from './ResultItem.jsx';
import Iframe from 'react-iframe';

let ResultList = React.createClass({
  render: function() {
    let counter = 0;
    let adWasShowed = false;
    return (
      <span>
      {(this.props.InitResultData.searchResultLength ?
      <div id="searchResultData" className="flights">
        {this.props.InitResultData.searchResult.map(function(itinerary) {
          let itin = null;
          if (!itinerary.is_hidden) {
            itin = <ResultItemContainer key={itinerary.id} itinerary={itinerary}/>;
            counter++;
          }

          let ad = null;
          if (!adWasShowed && !uaMobile && (counter == 2 || this.props.InitResultData.searchResultLength <= counter)) {
            adWasShowed = true;
            ad = <span key="ad">
                {itin}
                <div className="col-xs-12 itinerary">
                  <Iframe id="c7aed39b" name="mc79eba9" url="/static/adds.html"
                          frameborder="0" scrolling="no" width="100%" height="100%" position="relative"></Iframe>
                </div>
              </span>;
          }
          return ad || itin;
        }.bind(this))}
      </div>
        : null
      )}
      </span>
    )
  }
});

export default ResultList;
