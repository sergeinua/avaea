$(document).ready(function() {
  var lastUpdated = 0;

  var autoscrollme = function () {
    $('html, body').animate({ 
      scrollTop: $(document).height()-$(window).height()}, 
      140
    );
  };
  var getLogAction = function (lastUpdated) {
      // var lastUpdated = {};
      $.ajax({
          method: "POST",
          url: "/abo/getaction",
          data: {lastUpdated:lastUpdated}
      })
      .done(function( msg ) {
          if (msg.userActions.length) {
            msg.userActions.forEach(function(data) {
              // console.log( "Data retrived: " + data.actionType + ' id: ' + data.id);
              if (lastUpdated < data.id) {
                lastUpdated = data.id;
              }
              if (data.actionType == 'on_tile_choice') {
                var action = '';
                if (data.logInfo.action == 'filter_add') {
                  action = 'chose';
                } else {
                  action = 'destroyed';
                }
                $('#log_actions').append($('<div class="alert alert-info user_id_'
                  +data.user+'" role="info">User ID#'+data.user+' '+action+' tile: <b>'
                  +data.logInfo.tileName+'</b> with value <b>'
                  +data.logInfo.tileValue+'</b></div>'));
              }

              if (data.actionType == 'order_tiles') {
                var tiles = '';
                for (tile in data.logInfo) {
                  tiles += ' ' + data.logInfo[tile].name;
                }
                $('#log_actions').append($('<div class="alert alert-success user_id_'
                  +data.user+'" role="info">For user  ID#'+data.user+' tiles were generated with order: <b>'
                  +tiles+'</b></div>'
                ));
              }

              if (data.actionType == 'order_itineraries') {
                $('#log_actions').append($('<div class="alert alert-warning user_id_'
                  +data.user+'" role="info">For user  ID#'+data.user+' search complete: search id <b>'
                  +data.logInfo.searchUuid+'</b> with params <b>'

                  +'<br/>Departure: ' + data.logInfo.searchParams.DepartureLocationCode
                  +'<br/>Arrival: ' + data.logInfo.searchParams.ArrivalLocationCode
                  +'<br/>Cabin Class: ' + data.logInfo.searchParams.CabinClass
                  +'<br/>Departure Date: ' + data.logInfo.searchParams.DepartureTime
                  +'<br/>Return Date: ' + data.logInfo.searchParams.returnDate

                  +'</b></div>'
                ));
              }

              if (data.actionType == 'on_itinerary_purchase') {
                $('#log_actions').append($('<div class="alert alert-danger user_id_'
                  +data.user+'" role="info">User ID#'+data.user+' made order: tile id <b>'
                  +data.logInfo.itinerary.id+'</b></div>'
                ));
              }

            });
            autoscrollme();
          }
          // autoscrollme();
          // console.log(lastUpdated);
          getLogAction(lastUpdated);
      });
  }

  getLogAction(lastUpdated);
});
