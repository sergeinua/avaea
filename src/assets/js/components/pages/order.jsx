



$(document).ready(function() {

  //this places the React flight unit
  if (typeof ItineraryData != 'undefined' && $('#booking-flight-unit').length) {
      ReactContentRenderer.render(<ResultItem itinerary={ItineraryData} showFullInfo={true}/>, $('#booking-flight-unit'));
  }

});
