import React from 'react';
import ResultItemContainer from './ResultItem.jsx';
import Iframe from 'react-iframe';
import moment from 'moment';

let ResultList = React.createClass({
  render: function() {
    let counter = 0;
    let adWasShowed = false;
    return (
      <span>
      <div className="results-wrapper">
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
                <div id="wayfare-results-comparison" className="col-xs-12 itinerary wayfare results comparison-unit">
                  <Iframe id="c7aed39b" name="mc79eba9" className="wayfare" url="/static/adds_results_result.html"
                          frameborder="0" scrolling="no" width="100%" height="100%" position="relative"></Iframe>
                </div>
              </span>;
          }
          return ad || itin;
        }.bind(this))}
      </div>

        : null
      )}

      {!uaMobile ?
        <span>
        <div id="wayfare-results-deals" className="wayfare results deals-unit">
          <div className="wrapper">
          <Iframe
            id="c7aed39b"
            name="mc79eba9"
            className="wayfare"
            url={"//x.wayfareinteractive.com/x/ob/?L3gvd3d3L2RlbGl2ZXJ5L2Fmci5waHA/em9uZWlkPTU1NzU4JmFtcDthbXA7Y2I9SU5TRVJUX1JBTkRPTV9OVU1CRVJfSEVSRQ==&Ocity="
            + this.props.searchParams.DepartureLocationCode
            + "&Dcity="+this.props.searchParams.ArrivalLocationCode
            + "&WIN_date1=" + moment(this.props.searchParams.departureDate).format('MM/DD/YYYY')
            + (this.props.searchParams.returnDate ? "&WIN_date2=" + moment(this.props.searchParams.returnDate).format('MM/DD/YYYY'):'') }
            frameborder="0"
            scrolling="no"
            width="100%"
            height="100%"
            position="relative">
          </Iframe>
          </div>
        </div>
        <div id="wayfare-results-cross-sell" className="wayfare results cross-sell">
          <div className="wrapper">
            <Iframe
              id="cross-sell-2-1-2017"
              name="cross-sell"
              className="wayfare"
              url="/static/adds_results_cross_sell.html"
              frameborder="0"
              scrolling="no"
              width="100%"
              height="100%"
              position="relative">
            </Iframe>
          </div>
        </div>
        </span>
        :null
      }
      </div>
      </span>
    )
  }
});

export default ResultList;
