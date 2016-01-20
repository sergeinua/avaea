$(document).ready(function() {
  if(!$('.filter_user').length) {
    console.log('admin.js not suppose to be here. trying to quit');
    return true;
  }

  var lastUpdated = 0;

  var user_id = 0;
  var actionMap = {
    on_tile_choice        : {title: 'tile',                 colorClass: 'info'},
    order_tiles           : {title: 'tiles order',          colorClass: 'success'},
    order_itineraries     : {title: 'search',               colorClass: 'warning'},
    on_itinerary_purchase : {title: 'itinerary',            colorClass: 'danger'},
    tile_prediction       : {title: 'tile prediction',      colorClass: 'default'},
    itinerary_prediction  : {title: 'itinerary prediction', colorClass: 'active'}
  };
  var autoscrollme = function () {
    $('html, body').animate({ 
      scrollTop: $(document).height()-$(window).height()}, 
      140
    );
  };
  var getLogAction = function () {
      if (!user_id) {
        return false;
      }
      $.ajax({
          method: "POST",
          url: "/abo/getbyuser/" + user_id,
          data: {lastUpdated:lastUpdated}
      })
      .done(function( msg ) {
          if (msg.userActions.length) {
            msg.userActions.forEach(function(data) {
              if (lastUpdated < data.id) {
                lastUpdated = data.id;
              }
              var action = actionMap[data.actionType].title;
              var colorClass = actionMap[data.actionType].colorClass;
              if (data.actionType == 'on_tile_choice') {
                if (data.logInfo.action == 'filter_add') {
                  action = 'select tile';
                } else {
                  action = 'deselect tile';
                }
              }
              if (data.actionType == 'itinerary_prediction' || data.actionType == 'tile_prediction') {
                  data.actionType = 'prediction';
              }
              if (data.actionType == 'order_tiles') {
                for (tile in data.logInfo) {
                  data.logInfo[tile].filters = ['...'];
                }
                if (data.logInfo.action == 'order') {
                  action = 'itinerary ordered';
                } else {
                  action = 'itinerary expanded';
                }
              }
              var date = new Date(data.createdAt).toLocaleString();

              $('#log_actions').append($('<tr class="'+data.actionType+' alert '+colorClass+' user_id_'
                  +data.user+'"><td>'+date+'</td><td>'+data.id+'</td><td>'+action+'</td><td>'+JSON.stringify(data.logInfo)+'</td></tr>'));
            });

            $('.filters_checkbox').each(function() {
              filter = $(this).attr('for');
              if (filter && $(this).is(':checked')) {
                $('.alert').filter('.' + filter).show();
              } else if (filter) {
                $('.alert').filter('.' + filter).hide();
              }
            });

            autoscrollme();
          }
      });
  };

  setInterval(function() {getLogAction()}, 2000);

  $('.filter_user').click(function() {
    $('.alert').remove();
    user_id = $(this).attr('target');
    $('#user_filter_value').val('');
    if (user_id) {
      lastUpdated = 0;
      $('#user_filter_value').val(user_id);
    }

    return false;
  });

  $('.filters_checkbox').click(function() {
    $('.alert').show();
    $('.filters_checkbox').each(function() {
      filter = $(this).attr('for');
      if (filter && $(this).is(':checked')) {
        $('.alert').filter('.' + filter).show();
      } else if (filter) {
        $('.alert').filter('.' + filter).hide();
      }
    });
    return true;
  });

    var getSliderSettings = function() {
        return {
            dots: true,
            infinite: false,
            mobileFirst: true,
            adaptiveHeight: true,
            slidesToShow: Math.floor($('body').outerWidth(true)/300)
        }
    };
    $('#user_tiles').slick(getSliderSettings());
    $( window ).resize(function() {
        $('#user_tiles').slick('unslick');
        $('#user_tiles').slick(getSliderSettings());
    });
});
