$(document).ready(function() {
  if(!$('.filter_user').length) {
    console.log('admin.js not suppose to be here. trying to quit');
    return true;
  }

  var lastUpdated = 0;

  var autoscrollme = function () {
    $('html, body').animate({ 
      scrollTop: $(document).height()-$(window).height()}, 
      140
    );
  };
  var getLogAction = function () {
      $.ajax({
          method: "POST",
          url: "/abo/getaction",
          data: {lastUpdated:lastUpdated}
      })
      .done(function( msg ) {
          if (msg.userActions.length) {
            msg.userActions.forEach(function(data) {
              if (lastUpdated < data.id) {
                lastUpdated = data.id;
              }
              if (data.actionType == 'on_tile_choice') {
                var action = '';
                if (data.logInfo.action == 'filter_add') {
                  action = 'select';
                } else {
                  action = 'deselect';
                }
                $('#log_actions').append($('<div class="alert alert-info user_id_'
                  +data.user+'" role="info">['+data.createdAt+'] User ID#'+data.user+' '+action+' tile: <b>'
                  +data.logInfo.tileName+'</b> with value <b>'
                  +data.logInfo.tileValue+'</b></div>'));
              }

              if (data.actionType == 'order_tiles') {
                var tiles = '';
                for (tile in data.logInfo) {
                  tiles += ' ' + data.logInfo[tile].name + '('+data.logInfo[tile].order+')';
                }
                $('#log_actions').append($('<div class="alert alert-success user_id_'
                  +data.user+'" role="info">['+data.createdAt+'] For user  ID#'+data.user+' tiles were generated with order: <b>'
                  +tiles+'</b></div>'
                ));
              }

              if (data.actionType == 'order_itineraries') {
                $('#log_actions').append($('<div class="alert alert-warning user_id_'
                  +data.user+'" role="info">['+data.createdAt+'] For user  ID#'+data.user+' search complete: search id <b>'
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
                if (data.logInfo.action == 'order') {
                  action = ' ordered';
                } else {
                  action = ' expanded';
                }
                $('#log_actions').append($('<div class="alert alert-danger user_id_'
                  +data.user+'" role="info">['+data.createdAt+'] User ID#'+data.user + action +': itinerary id <b>'
                  +data.logInfo.itinerary.id+'</b></div>'
                ));
              }

              if (data.actionType == 'tile_prediction') {
                $('#log_actions').append($('<div class="alert alert-default user_id_'
                  +data.user+'" style="background-color: #e7e7e7" role="info">['+data.createdAt+'] System recalculated value for User <b>ID#' + data.user
                  +'</b> for tile <b>'+data.logInfo.tile_name+'</b> for search uuid <b>'+data.logInfo.uuid+'</b>:  '
                  +'<br/>Tile position: ' + data.logInfo.data.tile_position
                  +'<br/>Confidence: ' + data.logInfo.data.confidence
                  +'<br/>Counter: ' + data.logInfo.data.counter
                  +'</div>'
                ));
              }

              if (data.actionType == 'itinerary_prediction') {
                $('#log_actions').append($('<div class="alert alert-default user_id_'
                  +data.user+'" style="background-color: #e7e7e7" role="info">['+data.createdAt+'] System recalculated value for User <b>ID#' + data.user
                  +'</b> for itineraries type <b>'+data.logInfo.type+'</b> for search params <b>'+data.logInfo.uuid+'</b>:  '
                  +'<br/>Rank Min Recalculated: ' + data.logInfo.data.rankMin
                  +'<br/>Rank Max Recalculated: ' + data.logInfo.data.rankMax
                  +'</div>'
                ));
              }

            });
            autoscrollme();
          }
      });
  }

  setInterval(function() {getLogAction()}, 2000);

  $('.filter_user').click(function(event) {
    $('.alert').show();
    var filter = $(this).attr('target');
    if (filter) {
      $('.alert:visible').not('.' + filter).hide();
    }
    setTimeout(autoscrollme(), 500);
    return false;
  });

    var getSliderSettings = function() {
        return {
            dots: true,
            infinite: false,
            mobileFirst: true,
            adaptiveHeight: true,
            slidesToShow: Math.floor($('body').outerWidth(true)/300)
        }
    }
    $('#user_tiles').slick(getSliderSettings());
    $( window ).resize(function() {
        $('#user_tiles').slick('unslick');
        $('#user_tiles').slick(getSliderSettings());
    });
});
