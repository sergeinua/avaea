$(document).ready(function() {

  $('#snowflake').hide();
  $('#snowflake_params').hide();
  $('#spider').hide();

  // Config: timers intervals
  var cfg_interval_get_log_action = 14000;
  var cfg_interval_draw_chart =  14000;

  var currentChartType;
  var user_id = 0, prevLog, prevSnowflake, prevSpider,
    lastUpdated = 0,
    interval1, interval2;

  currentChartType = $('#chartSelection').val();

  $('.mymoreprofilebutton').click(function(el) {
    var cloneTarget = $(this).attr('for');
    var clone = $('#' + cloneTarget).clone().find("input").val("").end();

    clone.find('hr').removeClass('hidden');
    clone.appendTo($('#' + cloneTarget).parent());
    return false;
  });

  //remove fieldset
  $('.remove-fieldset').click(function(event){
    var fieldset = $(this).attr('fieldset'),
      iterator = $(this).attr('iterator');

    $.ajax({
      method: "POST",
      url: "/user/removeFieldSet",
      data: {fieldset: fieldset, iterator: iterator}
    })
      .done(function( msg ) {


        if (msg.error) {

          $('#timeAlert').text('Error saving data to ' + fieldset + '.')
            .fadeIn('slow', function () {
              $(this).fadeOut(5000, function () {
                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
              });
            }
          );

        } else {

          $('#' + fieldset + '[fieldset-number="' + iterator + '"]').remove();
          $('#' + fieldset + ':first > hr').remove();
          if ($('#' + fieldset + ' .remove-fieldset').length == 1) {
            $('#' + fieldset + ' .remove-fieldset').remove();
          }

          $('#timeAlert').text('Record was removed successfully.')
            .fadeIn('slow', function () {
              $(this).fadeOut(5000, function () {
                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
              });
            }
          );
        }
      });

  });

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
        scrollTop: 9999999
      },
      140
    );
  };
  var getLogAction = function () {
      if (!user_id) {
        return false;
      }
      $.ajax({
          method: "POST",
          url: "/getbyuser/" + user_id,
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

  var radarChartData = {
      labels: ["Price", "Duration", "Airline", "Outbound Departure", "Outbound Arrival", "Inbound Departure", "Inbound Arrival"],
      datasets: []
  };

  $('#chartSelection').on('change', function(){
    currentChartType = $(this).val();
    prevSnowflake = null;
    prevSpider = null;
    drawCurrentChartType();
  });

  $('.filter_user').submit(function() {
    var id = 0;
    user_id = $('#user_search_form').val();
    if (id = user_id.match(/^ID#(\d+)/)) {
      user_id = id[1];
    }

    if (user_id) {

      if (interval1) {
        clearInterval(interval1);
      }
      if (interval2) {
        clearInterval(interval2);
      }

      getLogAction();
      drawCurrentChartType();

      interval1 = setInterval(getLogAction, cfg_interval_get_log_action);
      interval2 = setInterval(drawCurrentChartType, cfg_interval_draw_chart);
    }

    return false;
  });

  var drawCurrentChartType = function() {
    if (!user_id) {
      return false;
    }

    if (currentChartType == 'snowflake') {
      getSnowflake();
    } else if (currentChartType == 'spiderchart') {
      getSpiderChart();
    }
  };

  var getSpiderChart = function() {
    var id = 0;
    if (user_id) {

      $('#snowflake').hide();
      $('#snowflake_params').hide();
      $('#spider').show();

      console.log('get spiderchart for userId: ' + user_id);

      $.ajax({
        method: "POST",
        url: "/gettilesbyuser/" + user_id
      })
        .done(function( msg ) {
          $('.user-profile-button').show();
          if (msg.data) {

            if (JSON.stringify(prevSpider) == JSON.stringify(msg)) {
              return true;
            }

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

            if (radarChartData.datasets.length) {
              window.myRadar = new Chart(document.getElementById("spider").getContext("2d")).Radar(radarChartData, {
                responsive: true
              });
            }

//          $('#chart_legend').html($(window.myRadar.generateLegend()));
//          console.log(window.myRadar.generateLegend());

            prevSpider = {};
            $.extend(true, prevSpider, msg);
          }


        });
    } else {
      $('.user-profile-button').hide();
      user_id = 0;
      window.myRadar.destroy();
      $('#chart_legend').html('');
    }

  };

  var getSnowflake = function() {
    var id = 0;
    if (user_id) {

      $('#spider').hide();
      $('#snowflake').show();
      $('#snowflake_params').show();

      console.log('get snowflake for userId: ' + user_id);
      $.ajax({
        method: "POST",
        url: "/gettilesbyuser/" + user_id
      })
        .done(function (msg) {

          if (JSON.stringify(prevSnowflake) == JSON.stringify(msg)) {
            return true;
          }

          console.log(msg);

          $('.user-profile-button').show();

          var _keys, _data = msg.data[0].E, _arr = [];

          if (!_data) {
            return;
          }

          for (var i = 0; i < _data.length; i++) {
            _keys = Object.keys(_data[i]);
            _arr.push(_data[i][_keys[0]]);
          }
          _arr = _arr.sort(function(a, b){return a-b}).reverse();

          snowflakeInit(document.getElementById("snowflake"), [_arr[0], _arr[1], _arr[2]]);

          prevSnowflake = {};
          $.extend(true, prevSnowflake, msg);

        });
    }  else {
      $('.user-profile-button').hide();
      user_id = 0;
      if(window.myRadar) {
        window.myRadar.destroy();
      };
      $('#chart_legend').html('');
    }

  };

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

  $('#userProfileButton').on('click', function(){
    if(user_id) {
      window.location.href = (GlobalSelectedAirline ? '/' + GlobalSelectedAirline : '') + '/profile/' + user_id;
    }
  })

});
