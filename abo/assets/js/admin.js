$(document).ready(function () {

  var socket = io.sails.connect(remoteSocket);
  log('Connecting to (' + remoteSocket + ') Sails.js...');

  socket.on('connect', function socketConnected() {
    socket.get('/user', function (res) {
      log('New comet message received :: ', res);
    });
    socket.on('user', function (event) {
      log('New comet message received :: ', event);
      switch (event.verb) {
        case 'created':
          // This is where code that handles this socket event should go.
          // (e.g. to update the user interface)
          // => see below for the contents of `event`
          if (user_id && event.data && event.data.id == user_id) {
            getLogAction();
            drawCurrentChartType();
          } else {
            getUsersStatistics();
            getUsersStatVoiceSearch();
          }
        break;
        default:
          console.warn('Unrecognized socket event (`%s`) from server:', event.verb, event);
      }
    });

  });

  socket.on('disconnect', function () {
    log('Lost connection to server');
    socket.off('user');
  });

  var socketAbo = io.sails.connect();
  log('Connecting to (local) Sails.js...');
  socketAbo.on('connect', function socketConnected() {
    // Listen for Comet messages from Sails
    socketAbo.on('message', function messageReceived(message) {

      ///////////////////////////////////////////////////////////
      // Replace the following with your own custom logic
      // to run when a new message arrives from the Sails.js
      // server.
      ///////////////////////////////////////////////////////////
      log('New comet message received :: ', message);
      //////////////////////////////////////////////////////

    });
  });


  $('#snowflake').hide();
  $('#spider').hide();

  var currentChartType;
  var user_id = 0, prevLog, prevSnowflake, prevSpider,
    lastUpdated = 0;
  var showGrid = false, dataGrid = [];

  currentChartType = $('#chartSelection').val();

  if (!$('.filter_user').length) {
    console.log('admin.js not suppose to be here. trying to quit');
    return true;
  }
  var serviceClass = {
    E: 'Economy',
    P: 'Premium',
    B: 'Business',
    F: 'First'
  };

  var substringMatcher = function (strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });

      cb(matches);
    };
  };

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
      suggestion: function (vars) {
        return '<div>' + vars + '</div>';
      }
    }
  });

  var radarChartData = {
    labels: ["Price", "Duration", "Airline", "Outbound Departure", "Outbound Arrival", "Inbound Departure", "Inbound Arrival"],
    datasets: []
  };

  var actionMap = {
    on_tile_choice:         {title: 'tile', colorClass: 'info'},
    order_tiles:            {title: 'tiles order', colorClass: 'success'},
    search:                 {title: 'search', colorClass: 'warning'},
    on_itinerary_purchase:  {title: 'itinerary choice', colorClass: 'danger'},
    tile_prediction:        {title: 'tile prediction', colorClass: 'default'},
    itinerary_prediction:   {title: 'itinerary prediction', colorClass: 'active'},
    voice_search:           {title: 'voice_search', colorClass: 'voice-search'},
    empty:                  {title: 'empty log', colorClass: 'danger'}
  };

  $('#chartSelection').on('change', function () {
    currentChartType = $(this).val();
    prevSnowflake = null;
    prevSpider = null;
    drawCurrentChartType();
  });

  $('.filter_user').submit(function () {
    var id = 0;
    user_id = $('#user_search_form').val();
    if (id = user_id.match(/^ID#(\d+)/)) {
      user_id = id[1];
    }

    if (user_id) {
      lastUpdated = 0;
      $('#log_actions').html('');
      getLogAction();
      drawCurrentChartType();
    }

    return false;
  });

  $('.filters_checkbox').click(function () {
    checkedFilters();
    return true;
  });

  $('#userProfileButton').on('click', function () {
    if (user_id) {
      window.location.href = (GlobalSelectedAirline ? '/' + GlobalSelectedAirline : '') + '/profile/' + user_id;
    }
  });

  $('.menu-tab').click(function (e) {
    var tab = $(e.target).attr('for');
    changeTabNav(tab);
    $('.menu-tab[for=' + tab + ']').parents('.container-fluid').find('.navbar-toggle[aria-expanded=true]').trigger('click');
  });
  var activeTab;
  var changeTabNav = function (tab) {
    if (!tab || $('.menu-tab[for=' + tab + ']').hasClass('active')) return;
    activeTab = tab;
    $('.menu-tab').removeClass('active');
    $('.menu-tab[for=' + tab + ']').addClass('active');
    $('.dataContainer').removeClass('active').addClass('hidden');
    $('#' + tab).removeClass('hidden').addClass('active');
    $('.navbar-brand').text($('.menu-tab[for=' + tab + ']').text());

    switch (tab) {
      case 'user_search':
        window.location.hash = 'UserInfo';
      break;
      case 'gridUsersStat':
        window.location.hash = 'SearchesLog';
        $('#gridUsersStat').jsGrid('refresh');
        getUsersStatistics();
      break;
      case 'gridOverallStat':
        window.location.hash = 'SearchesPerformance';
        getUsersStatistics();
      break;
      case 'gridUsersStatVoiceSearch':
        window.location.hash = 'VoiceParsingLog';
        getUsersStatVoiceSearch();
      break;
    }
  };


  var autoscrollme = function () {
    $('#log_table_div').animate({
        scrollTop: 9999999
      },
      140
    );
  };
  var getLogAction = function () {
    if (!user_id || !socketAbo.isConnected()) {
      return false;
    }

    socketAbo.post("/getbyuser/" + user_id, {lastUpdated: lastUpdated}, function (msg, jwres) {

      if (msg.userActions.length) {

        msg.userActions.forEach(function (data) {
          if (lastUpdated < data.id) {
            lastUpdated = data.id;
          }
          if (!actionMap[data.actionType]) return;

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
            //if (data.logInfo.action == 'order') {
            //  action = 'itinerary ordered';
            //} else {
            //  action = 'itinerary expanded';
            //}
          }

          var date = new Date(data.createdAt).toLocaleString();
          dataGrid.push(data);
          if (data.actionType == "search" && showGrid) {
            insertRowToGrid('#jsGrid', data);
          }
          $('#log_actions').append($('<tr class="' + data.actionType + ' alert ' + colorClass + ' user_id_'
          + data.user + '"><td>' + date + '</td><td>' + data.id + '</td><td>' + action + '</td><td>' + JSON.stringify(data.logInfo) + '</td></tr>'));
        });

        checkedFilters();
        autoscrollme();
      }
    });
  };

  var drawCurrentChartType = function () {
    if (!user_id) {
      return false;
    }

    if (currentChartType == 'snowflake') {
      getSnowflake();
    } else if (currentChartType == 'spiderchart') {
      getSpiderChart();
    }
  };

  var getSpiderChart = function () {
    var id = 0;
    if (user_id) {

      $('#snowflake').hide();
      $('#spider').show();

      console.log('get spiderchart for userId: ' + user_id);
      socketAbo.post("/gettilesbyuser/" + user_id, {}, function (msg) {
        $('.user-profile-button').show();
        if (msg.data) {

          if (JSON.stringify(prevSpider) == JSON.stringify(msg)) {
            return true;
          }

          msg.data.forEach(function (item) {
            if (typeof(item.E) != 'undefined') {
              var radarChartDataItem = {
                label: "User tile prediction values (" + serviceClass['E'] + ")",
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

  var getSnowflake = function () {
    var id = 0;
    if (user_id) {

      $('#spider').hide();
      $('#snowflake').show();

      console.log('get snowflake for userId: ' + user_id);
      socketAbo.post("/gettilesbyuser/" + user_id, {}, function (msg) {

        if (JSON.stringify(prevSnowflake) == JSON.stringify(msg)) {
          return true;
        }

        $('.user-profile-button').show();

        var _keys, _data = msg.data[0].E, _arr = [];

        if (!_data) {
          return;
        }

        for (var i = 0; i < _data.length; i++) {
          _keys = Object.keys(_data[i]);
          _arr.push(_data[i][_keys[0]]);
        }
        _arr = _arr.sort(function (a, b) {
          return a - b
        }).reverse();

        snowflakeInit(document.getElementById("snowflake"), [_arr[0], _arr[1], _arr[2]]);

        prevSnowflake = {};
        $.extend(true, prevSnowflake, msg);

      });
    } else {
      $('.user-profile-button').hide();
      user_id = 0;
      if (window.myRadar) {
        window.myRadar.destroy();
      };
      $('#chart_legend').html('');
    }

  };

  var checkedFilters = function () {
    $('.alert').hide();
    var cntFilters = 0, nameFilter, filtersActive = [];
    $('.filters_checkbox').each(function () {
      var filter = $(this).attr('for');
      if (filter && $(this).is(':checked')) {
        cntFilters++;
        nameFilter = filter;
        if (filtersActive.indexOf(filter) == -1) {
          filtersActive.push(filter);
        }
      }
    });

    if (cntFilters == 1 && nameFilter == 'search') {
      generateGrid(nameFilter);
    } else {
      showGrid = false;
      $('#jsGrid').jsGrid('destroy');
      filtersActive.forEach(function (item) {
        $('.alert').filter('.' + item).show();
      });
    }
  };

  var generateGrid = function (nameFilter) {
    if (!dataGrid.length) return;

    if (nameFilter == 'search') {
      if (!showGrid) {
        generateGridSearch(nameFilter, dataGrid);
        $('#jsGrid').jsGrid('sort', {field: 'id', order: 'desc'});
        showGrid = true;
      }
    }
  };


  var lastIdUsersStat = 0, dataUsersStats = [], dataUsersStatsFormat = [],
    showGridUsersStat = false, showGridOverallStat = false;
  var getUsersStatistics = function () {
    socketAbo.post('/getActionByType', {lastUpdated: lastIdUsersStat, actionType: 'search'}, function (result, jwres) {
      if (result.length) {
        result.forEach(function (item) {
          if (lastIdUsersStat < item.id) {
            lastIdUsersStat = item.id;
          }
          dataUsersStats.push(item);
          dataUsersStatsFormat.push(getRowGridSearch(item));

          if (showGridUsersStat) {
            //insertRowToGrid('#gridUsersStat', item);
            $('#gridUsersStat').jsGrid('loadData', dataUsersStatsFormat).done(function() {
              $('#gridUsersStat').jsGrid('sort', {field: 'id', order: 'desc'});
            });
          }
        });
      }

      if (dataUsersStats.length) {
        if (!showGridUsersStat && activeTab == 'gridUsersStat') {
          $('#gridUsersStat').jsGrid('loadData', dataUsersStatsFormat).done(function() {
            showGridUsersStat = true;
          });
        }

        $('#gridOverallStat').jsGrid('loadData', dataUsersStats).done(function() {
          showGridOverallStat = true;
        });
      }

      return dataUsersStats;
    });
  };

  var lastIdUsersStatVS = 0, dataUsersStatVoiceSearch = [], showGridUsersStatVS = false;
  var getUsersStatVoiceSearch = function () {
    socketAbo.post('/getActionByType', {lastUpdated: lastIdUsersStatVS, actionType: 'voice_search'}, function (result, jwres) {
      if (result.length) {
        result.forEach(function (item) {
          if (lastIdUsersStatVS < item.id) {
            lastIdUsersStatVS = item.id;
          }

          dataUsersStatVoiceSearch.push(getRowGridSearch(item));

          if (showGridUsersStatVS) {
            $('#gridUsersStatVoiceSearch').jsGrid('loadData', dataUsersStatVoiceSearch).done(function() {
              $('#gridUsersStatVoiceSearch').jsGrid('sort', {field: 'id', order: 'desc'});
            });
          }
        });
      }

      if (dataUsersStatVoiceSearch.length) {
        if (!showGridUsersStatVS && activeTab == 'gridUsersStatVoiceSearch') {
          $('#gridUsersStatVoiceSearch').jsGrid('loadData', dataUsersStatVoiceSearch).done(function() {
            showGridUsersStatVS = true;
            $('#gridUsersStatVoiceSearch').jsGrid('sort', {field: 'id', order: 'desc'});
          });
        }
      }

      return dataUsersStatVoiceSearch;
    });
  };

  generateGridUsersStat();
  generateGridOverallStat();
  genGridUsersStatVoiceSearch();

  // Simple log function to keep the example simple
  function log() {
    if (typeof console !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }

  var urlHash = window.location.hash;
  if (urlHash) {
    switch (urlHash) {
      case '#UserInfo':
        activeTab = 'user_search';
        break;
      case '#SearchesLog':
        activeTab = 'gridUsersStat';
        break;
      case '#SearchesPerformance':
        activeTab = 'gridOverallStat';
        break;
      case '#VoiceParsingLog':
        activeTab =  'gridUsersStatVoiceSearch';
        break;
    }
    $('.menu-tab[for=' + activeTab + ']').trigger('click');
  }

});
