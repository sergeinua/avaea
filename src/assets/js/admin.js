$(document).ready(function() {
  if(!$('.filter_user').length) {
    console.log('admin.js not suppose to be here. trying to quit');
    return true;
  }

  var lastUpdated = 0;

  var filterMessage = function () {
    if (filter = $('#user_filter_value').val()) {
      if (filter) {
        $('.alert:visible').not('.' + filter).hide();
      }
    }
  };

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
                $('#log_actions').append($('<tr class="on_tile_choice alert info user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>'+action+' tile</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'));
              }

              if (data.actionType == 'order_tiles') {
                for (tile in data.logInfo) {
                  data.logInfo[tile].filters = ['...'];
                }
                $('#log_actions').append($('<tr class="order_tiles alert success user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>tiles order</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'order_itineraries') {
                $('#log_actions').append($('<tr class="order_itineraries alert warning user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>search</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'on_itinerary_purchase') {
                if (data.logInfo.action == 'order') {
                  action = ' ordered';
                } else {
                  action = ' expanded';
                }
                $('#log_actions').append($('<tr class="on_itinerary_purchase alert danger user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>itinerary '+action+'</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'tile_prediction') {
                $('#log_actions').append($('<tr class="prediction alert default user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>tile prediction</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'itinerary_prediction') {
                $('#log_actions').append($('<tr class="prediction alert active user_id_'
                  +data.user+'"><td>'+data.id+'</td><td>itineraries prediction</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }
            });

            $('.filters_checkbox').each(function() {
              filter = $(this).attr('for');
              //console.log('filter chosen: ', filter);
              if (filter && $(this).is(':checked')) {
                $('.alert').filter('.' + filter).show();
              } else if (filter) {
                $('.alert').filter('.' + filter).hide();
              }
            });

            filterMessage();
            autoscrollme();
          }
      });
  };

  setInterval(function() {getLogAction()}, 2000);

  $('.filter_user').click(function() {
    $('.alert').show();
    var filter = $(this).attr('target');
    $('#user_filter_value').val('');
    if (filter) {
      $('.alert:visible').not('.' + filter).hide();
      $('#user_filter_value').val(filter);
    }
    setTimeout(autoscrollme(), 500);
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
    filterMessage();
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
