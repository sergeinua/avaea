$(document).ready(function() {
  if(!$('.filter_user').length) {
    console.log('admin.js not suppose to be here. trying to quit');
    return true;
  }
  var serviceClass = {
    E:'Economy',
    P:'Premium',
    B:'Business',
    F:'First'
  };

  $('.navbar-nav li').click(function() {
        $('.navbar-nav li').each(function(page) {
            var t = $(this).find('a').attr('target');
            $(this).removeClass('active');
            $('#'+t).addClass('hidden');
        });
        var target = $(this).find('a').attr('target');
        $(this).addClass('active');
        console.log(target);
        $('#' + target).removeClass('hidden');
        return false;
    });
    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substringRegex;

          // an array that will be populated with substring matches
          matches = [];

          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');

          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              matches.push(str);
            }
          });

          cb(matches);
        };
      };
      console.log(user_list);
    $('#user_search_form').typeahead({
      hint: true,
      minLength: 2
    }, {
        name: 'users',
        source: substringMatcher(user_list),
        templates: {
            empty: [
                '<div class="empty-message">',
                'unable to find the user that match the current query',
                '</div>'
            ].join('\n'),
            suggestion: function(vars) { return '<div>'+vars + '</div>'; }
        }
    });


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
    $('#log_table_div').animate({ 
      scrollTop: $('#log_table_div').height()-$(window).height()}, 
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
                for (var tile in data.logInfo) {
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

  setInterval(function() {getLogAction();}, 2000);
    var radarChartData = {
        labels: ["Price", "Duration", "Airline", "Outbound Departure", "Outbound Arrival", "Inbound Departure", "Inbound Arrival"],
        datasets: []
    };

  $('.filter_user').submit(function() {
    $('.alert').remove();
    user_id = $('#user_search_form').val();
    var id = 0;
    if (id = user_id.match(/^ID#(\d+)/)) {
      user_id = id[1];

      $.ajax({
          method: "POST",
          url: "/abo/gettilesbyuser/" + user_id
      })
      .done(function( msg ) {

        if (msg.data) {
            msg.data.forEach(function(item) {
                if (typeof(item.E) != 'undefined') {
                    console.log(item);
                    var radarChartDataItem = {
                        label: "User tile prediction values ("+serviceClass['E']+")",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: [
                            item.E[6]['price_tile'],//"Price"
                            item.E[5]['duration_tile'],//"Duration"
                            item.E[4]['airline_tile'],//"Airline"
                            item.E[3]['departure_tile'],//"Outbound Departure"
                            item.E[2]['arrival_tile'],//"Outbound Arrival"
                            item.E[1]['destination_departure_tile'],//"Inbound Departure"
                            item.E[0]['source_arrival_tile']//"Inbound Arrival"
                        ]
                    };
//                    console.log(radarChartDataItem);
                    radarChartData.datasets.push(radarChartDataItem);
                }

            });
          window.myRadar = new Chart(document.getElementById("canvas").getContext("2d")).Radar(radarChartData, {
            responsive: true
          });
//          $('#chart_legend').html($(window.myRadar.generateLegend()));
//          console.log(window.myRadar.generateLegend());
        }


      });
    } else {
        user_id = 0;
        window.myRadar.destroy();
        $('#chart_legend').html('');
    }
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

});