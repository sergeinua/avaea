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
                $('#log_actions').append($('<tr class="alert alert-info user_id_'
                  +data.user+'" role="info"><td>'+data.id+'</td><td>'+action+' tile</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'));
              }

              if (data.actionType == 'order_tiles') {
                for (tile in data.logInfo) {
                  data.logInfo[tile].filters = ['...'];
                }
                $('#log_actions').append($('<tr class="alert alert-success user_id_'
                  +data.user+'" role="info"><td>'+data.id+'</td><td>tiles order</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'order_itineraries') {
                $('#log_actions').append($('<tr class="alert alert-warning user_id_'
                  +data.user+'" role="info"><td>'+data.id+'</td><td>search</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'on_itinerary_purchase') {
                if (data.logInfo.action == 'order') {
                  action = ' ordered';
                } else {
                  action = ' expanded';
                }
                $('#log_actions').append($('<tr class="alert alert-danger user_id_'
                  +data.user+'" role="info"><td>'+data.id+'</td><td>itinerary '+action+'</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'tile_prediction') {
                $('#log_actions').append($('<tr class="alert alert-default user_id_'
                  +data.user+'" style="background-color: #e7e7e7" role="info"><td>'+data.id+'</td><td>tile prediction</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
                ));
              }

              if (data.actionType == 'itinerary_prediction') {
                $('#log_actions').append($('<tr class="alert alert-default user_id_'
                  +data.user+'" style="background-color: #e7e7e7" role="info"><td>'+data.id+'</td><td>itineraries prediction</td><td>'+JSON.stringify(data.logInfo)+'</td><td>User ID#'+data.user+'</td><td>'+data.createdAt+'</td></tr>'
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
