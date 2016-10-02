



$(document).ready(function() {

  //this places the React flight unit
  if (typeof ItineraryData != 'undefined' && $('#booked-flight-unit').length) {
      ReactContentRenderer.render(<ResultItem itinerary={ItineraryData} showFullInfo={true}/>, $('#booked-flight-unit'));
  }

});
