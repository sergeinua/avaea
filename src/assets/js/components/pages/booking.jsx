



$(document).ready(function() {
	
	//this places the React flight unit
  if (typeof ItineraryData != 'undefined' && $('#booked-flight-unit').length) {
      ReactContentRenderer.render(<ResultItem itinerary={ItineraryData}/>, $('#booked-flight-unit'));
  }
  
});
