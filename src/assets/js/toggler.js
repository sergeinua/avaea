/* global $ */
$(document).ready(function() {
    $('#timeAlert').fadeOut(5000, function () {
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) -20) + 'px');
    });
    var showTotal = !!$('.itinerary:visible').length;
    /**
    * Possible types
    * on_tile_choice | on_itinerary_purchase
    *
    */
    var logAction = function (type, data) {
        $.ajax({
            method: "POST",
            url: "/prediction/" + type,
            data: data
        })
        .done(function( msg ) {
            //console.log( "Data Saved: " + msg );
        });
    };

    //tile recalculation
    var recalcTiles = function () {
        var filters = $('.selectedfilters').attr('filters');
        filters = filters.split(' ');
        var groups = {};
        if (filters.length) {
            filters.forEach(function(filter) {
              if (filter && filter != '') {
                  var tileGroup = filter.replace(/(tile).+/, '$1');
                  if (typeof groups[tileGroup] == 'undefined') {
                    groups[tileGroup] = [];
                  }
                  groups[tileGroup].push(filter);
              }
            });
        }
        $('#tiles').find('li').each(function(item) {
            var tile = $(this);
            var sCount = 0;
            if (tile.hasClass('selected')) {
                sCount = $('.' + tile.attr('for') + ':visible').length;
            } else {
                if (tile.attr('for')) {
                  var tileGroup = tile.attr('for').replace(/(tile).+/, '$1');
                  var predictedClass = '.' + tile.attr('for');
                  if ($('#smart').prop('checked')) {
                    predictedClass = predictedClass + '.smart';
                  }
                  var predictedResult = $(predictedClass);

                  for (var key in groups) {
                    if (!groups.hasOwnProperty(key)) continue;

                    if (key != tileGroup) {
                      predictedResult = predictedResult.filter('.' + groups[key].join(',.'));
                    }
                  }
                  sCount = predictedResult.length;
                }
            }
            if ( sCount > 0 ) {
                $('[for='+tile.attr('for')+'] > span.badge').text(sCount);
                tile.removeClass('disabled');
            } else if ( sCount <= 0 ) {
                $('[for='+tile.attr('for')+'] > span.badge').text('');
                tile.removeClass('selected');
                var filters = $('.selectedfilters').attr('filters');
                var re = new RegExp('\b' + tile.attr('for') + '\b');
                filters = filters.replace(re, '');
                $('.selectedfilters').attr('filters', filters);
                tile.addClass('disabled');
            }
        });
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20) + 'px');
    };
    var filtersCount = {};
    var filterItineraries = function () {
        var filters = $('.selectedfilters').attr('filters');
        if (filters) {
            filters = filters.split(' ');
        }
        $('.itinerary').show();
        $('.mybucket').each(function() {

            var selectedTileFilers = [];
            var tileName = $(this).attr('id');
            $(this).find('li').each(function() {
                var tileId = $(this).attr('for');
                if ($.inArray(tileId, filters) != -1) {
                    selectedTileFilers.push(tileId);
                }
            });

            if (selectedTileFilers.length) {
                filtersCount[tileName] = $('.itinerary:visible').filter('.' + selectedTileFilers.join(',.')).length;
                $('.itinerary:visible').not('.' + selectedTileFilers.join(',.')).hide();
            }
        });

        if ($('#smart').prop('checked')) {
          $('.itinerary:visible').not('.smart').hide();
          recalcTiles();
        }

        if (showTotal) {
            var sCount = $('.itinerary:visible').length;
            $('#search_count').text(sCount);
            $('#search_count').removeClass('hidden');
            recalcTiles();
        }
    };

    filterItineraries();

    $('#clear').click(function() {
        $('.selectedfilters').attr('filters', '');
        $('#tiles').find('li.selected').removeClass('selected');
        $($('.slick-slide')[0]).trigger('click');
        filterItineraries();
    });

    $('#undo').click(function() {
        var filters = $('.selectedfilters').attr('filters');
        filters = filters.split(' ');
        if (filters.length) {
            var lastElement = filters[filters.length - 1];
            filters.pop();
            $('.selectedfilters').attr('filters', filters.join(' '));
            if (lastElement) {
              var slickIndex = $('[for='+lastElement+']').parent().parent().attr('data-slick-index') || 0;
              $($('.slick-slide')[slickIndex]).trigger('click');
              $('[for='+lastElement+']').removeClass('selected');
            }
            filterItineraries();
        }
    });

    var stopPropagationSmart = false;
    var smartCache = [];
    $('#smart').change(function() {
      if (!stopPropagationSmart) {
        if (confirm('All buckets will be reset. Are you sure?')) {
          if (!$(this).prop('checked')) {
            // restore initial sorting
            $('#searchResultData').replaceWith(smartCache);
            smartCache = [];
          }
          $('#clear').click();
          if ($(this).prop('checked')) {
            // clone result for restoring initial sorting when smart mode is off
            smartCache = $('#searchResultData').clone(true);

            var myArray = $('.itinerary.smart');

            // sort itineraries based on smart rank
            myArray.sort(function (a, b) {

              // convert to integers from strings
              a = parseInt($(a).attr("smart"));
              b = parseInt($(b).attr("smart"));
              // compare
              if(a > b) {
                return 1;
              } else if(a < b) {
                return -1;
              } else {
                return 0;
              }
            });
            // remove visible itineraries and place it in smart order
            $('.itinerary.smart').detach();
            $('#searchResultData').prepend(myArray);
          }
        } else {
          stopPropagationSmart = true;
          $(this).bootstrapToggle($(this).prop('checked')?'off':'on');
        }
      } else {
        stopPropagationSmart = false;
      }
    });

    $('.mymoreprofilebutton').click(function(el) {
        var cloneTarget = $(this).attr('for');
        var clone = $('#' + cloneTarget).clone().find("input").val("").end();

        clone.find('hr').removeClass('hidden');
        clone.appendTo($('#' + cloneTarget).parent());
        return false;
    });

    // more/less button for merchandising
    $('.mymorebutton').click(function() {
        var _it = $(this).attr('for');
        var _mmcnt = '.mymorecontent' + _it;
        $(_mmcnt).toggleClass(function() {
            if($(_mmcnt).is( ".hidden" )) {
                $('#mymorebtn' + _it).text("less")
            } else {
                $('#mymorebtn' + _it).text("more")
            }
            return "hidden";
        });
        return false;
    });

    $('.recommended').each(function(item){
        $(this).find('div:first').find('div:first').find('div:first')
        .append($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
    });
/*

    //set dates for search request
    //min attr for date pickers
    $('#departureDate').attr('min', new Date().toISOString().slice(0, 10));
    $('#departureDate').change(function() {
        $('#returnDate').attr('min', $('#departureDate').val().replace(/\s/g, ''));
    });
    // Set +14days for empty returnDate
    $('#returnDate').focus(function(){
        if($('#returnDate').val().trim() == '' && $('#departureDate').val().trim() != '')
        {
            var dd = Date.parse($('#departureDate').val().replace(/\s/g, ''));
            $('#returnDate').val(new Date(dd + 86400000*14).toISOString().slice(0, 10));
            $('#returnDate').attr('min', $('#departureDate').val().replace(/\s/g, ''));
        }
    });
*/

    //tiles
    var firstSelectionCount = {};
    var globalSelectionCount = 0;
    var numberOfTiles = $('.mybucket').length;

    $('.list-group-item').click(function(event) {
        if ($(this).hasClass('disabled')) {
            return false;
        }
        var tileId = $(this).parent().parent().find('a').attr('id');
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            var filters = $('.selectedfilters').attr('filters');
            filters = filters.split(' ');

            //Check if the very last bucket in a tile is unselected
            var needRecalculate = !$(this).siblings('.selected').length;
            // log to abo
            logAction('on_tile_choice', {
                action         : 'filter_remove',
                tileName    : tileId,
                tileValue     : $(this).html(),
                tileId           : $(this).attr('for'),
                sample       : (-1.0*firstSelectionCount[ tileId ])/numberOfTiles,
                recalculate : needRecalculate
            });
            var result = [];
            var current = $(this).attr('for');
            if (filters.length) {
              filters.forEach(function(filter) {
                if (filter && filter != current && filter != '') {
                  result.push(filter);
                }
              });

              $('.selectedfilters').attr('filters', result.join(' '));
            }
        } else {
            $(this).addClass('selected');
            var filters = $('.selectedfilters').attr('filters');
            $('.selectedfilters').attr('filters', filters + ' ' + $(this).attr('for'));

             // Check if the very first bucket in a tile is selected
            var needRecalculate = !$(this).siblings('.selected').length;
            globalSelectionCount++;
            if (needRecalculate) {
              firstSelectionCount[ tileId ] = globalSelectionCount;
            }
            // log to abo
            logAction('on_tile_choice', {
                action         : 'filter_add',
                tileName    : tileId,
                tileValue     : $(this).html(),
                tileId           : $(this).attr('for'),
                sample       : (1.0*firstSelectionCount[ tileId ])/numberOfTiles,
                recalculate : needRecalculate
            });

            var current = $(this).attr('for');
            if (current && current.indexOf('airline_tile') != -1) {
                checkAirlineFlierMilesProgram(current);
            }
        }
        // recalculate search result
        filterItineraries();
    });

    var getSliderSettings = function() {
        return {
            dots: false,
            arrows: false,
            infinite: false,
            mobileFirst: true,
            adaptiveHeight: false,
            //slidesToShow: Math.min(Math.floor($('body').outerWidth(true)/150), $('.mybucket').length),
            slidesToScroll: 1,
            variableWidth: true,
            appendArrows: $('.myarr .slick'),
            prevArrow: '<button type="button" data-role="none" class="slick-prev"></button>',
            //appendDots: $('.myarr'), // For DEMO-97. But can't setup position in div without slick-narrow bug
            focusOnSelect: true
        }
    };
    $('#tiles').slick(getSliderSettings());
    //$( window ).resize(function() {
        //$('#tiles').slick('unslick');
        //$('#tiles').slick(getSliderSettings());
        //$('.selectedfilters > li').each(function(index) {
            //var target = $(this).attr('for');
            //$('#' + target).hide();
        //})
    //});


    /**
     * Make request to the remote server and fetch data for the typehead rendering
     *
     * @param {string} controllerName
     * @param {string} actionName
     * @returns {Function}
     */
    var fetchTypeheadSrc = function(controllerName, actionName) {
        return function (q, cb) {
            $.ajax({
                    url: '/'+controllerName+'/'+actionName,
                    type: 'get',
                    data: {q: q},
                    dataType: 'json',
                    async: false // required, because typehead doesn't work with ajax in async mode
                })
                .done(function( msg ) {
                    cb(msg ? msg : []);
                })
                .fail(function (msg) {
                    cb([{city: "System error", name: "please try later", value: "---"}]);
                });
        };
    };

  var drawAirportData = function (target) {
   var cityName = $('#' + target).attr('city');
   var airportCode = $('#' + target).val();
    if (target == 'originAirport') {
      if (airportCode) {
        $('#from-area').addClass('hidden');
        $('#from-area-selected').removeClass('hidden');
        $('#from-airport-selected').text(airportCode);
        $('#from-city-selected').text(cityName);
      } else {
        $('#from-area-selected').addClass('hidden');
        $('#from-area').removeClass('hidden');
        $('#from-airport-selected').text('');
        $('#from-city-selected').text('');
      }
    } else if (target == 'destinationAirport') {
      if (airportCode) {
        $('#to-area').addClass('hidden');
        $('#to-area-selected').removeClass('hidden');
        $('#to-airport-selected').text(airportCode);
        $('#to-city-selected').text(cityName);
      } else {
        $('#to-area-selected').addClass('hidden');
        $('#to-area').removeClass('hidden');
        $('#to-airport-selected').text('');
        $('#to-city-selected').text('');
      }
    }
  };
    $('#airport-input').typeahead({
      hint: true,
      highlight: true,
      minLength: 2
    }, {
      name: 'airports',
      display: 'value',
      limit: 8,
      source: fetchTypeheadSrc('ac', 'airports'),
      templates: {
        empty: [
          '<div class="empty-message">',
          'unable to find the airport that match the current query',
          '</div>'
        ].join('\n'),
        suggestion: function(vars) {
          return '<div>('+vars.value+') '+vars.city+', '+vars.name+'</div>';
        }
      }
    }).on('typeahead:selected', function (obj, datum) {
      $('#' + $(this).attr('target')).val(datum.value);
      $('#' + $(this).attr('target')).attr('city', datum.city);
      $('#search_title').addClass('hidden');
      $('#main').removeClass('hidden');
      $('#main_title').removeClass('hidden');
      $('#airport-input').val('');
      $('#airport-input').typeahead('val','');
      //$('#airport-input').typeahead('setQuery', '');
      drawAirportData($(this).attr('target'));
    });
    $('.tt-hint').addClass('form-control');

    //search count
    var sCount = $('.itinerary:visible').length;
    $('#search_count').text(sCount);
    if (showTotal) {
      $('#search_count').removeClass('hidden');
      $('body').css('padding-top', ($('#tiles_ui').outerHeight(true)) + 'px');
      recalcTiles();
    }

    //loading
    $('#search_form').submit(function(event) {
        $('.search-button').hide();
        $("body").addClass("loading");
        return true;
    });

    $('.itinerary').click(function (event) {
        $('.itinerary').removeClass('selected');
        $(this).addClass('selected');
        var itineraryId = $(this).attr('id');
        var details = $(this).attr('for');
        if (details) {
            $('#' + details).toggle();

            if ($('#' + details).is(':visible')) {
                $(this).find('div:first').find('div:first').find('div:first').find('span')
                    .replaceWith($('<span class="label label-success"><span class="glyphicon glyphicon-star"></span>recommended</span>'));

                logAction('on_itinerary_purchase', {
                    action    : 'itinerary_expanded',
                    itinerary : {
                        id : itineraryId
                    }
                });
            } else {
                $(this).find('div:first').find('div:first').find('div:first').find('span')
                    .replaceWith($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
            }
        }

        //$('#buy_button').removeAttr('disabled');
    });

    $('.buy-button>button').click(function(event) {
        //var id = $(this).parent().parent().parent().parent().attr('id');
        //console.log('Order id:', id);
        if ($('.selected')) {
            location.href = '/order?id=' + $('.selected').attr('id');
        }
    });

  /**
   * Client validation during booking of itinerary
   */
  $("#form_booking").validate({
        rules: {
            PaxType: {
                required: true
            },
            FirstName: {
                required: true
            },
            LastName: {
                required: true
            },
            Gender: {
                required: true
            },
            DateOfBirth: {
                required: true,
                date: true,
                minlength: 10,
                maxlength: 10
            },
            Address1: {
                required: true
            },
            City: {
                required: true
            },
            State: {
                required: true
            },
            Country: {
                required: true
            },
            ZipCode: {
                required: true
            },
            CardType: {
                required: true
            },
            CardNumber: {
                required: true,
                digits: true,
                minlength: 16,
                maxlength: 16
            },
            ExpiryDate: {
                required: true,
                minlength: 7,
                maxlength: 7
            },
            CVV: {
                required: true,
                digits: true,
                minlength: 3,
                maxlength: 3
            }
        },
        errorPlacement: function(error, element){}, // Skip error messages
        highlight: function(input) {
            $(input).parent().addClass('has-error');
        },
        unhighlight: function(input) {
            $(input).parent().removeClass('has-error');
        }
        //onkeyup: false
    });

    $("#cancelMilesPrograms").click(function () {
        cancelMilesPrograms();
    });

    var cancelMilesPrograms = function () {
        var _fieldset = $('#AFFMP');
        _fieldset.addClass('hidden');
        $('#buy_button, #searchResultData, nav.navbar').removeClass('hidden');
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20) + 'px');
        $( window ).trigger('resize');
        $('input[name=airlineName]', _fieldset).val('');
        $('input[name=accountNumber]', _fieldset).val('');
        $('input[name=flierMiles]', _fieldset).val('');
        $('input[name=expirationDate]', _fieldset).val('');
    };

    var checkAirlineFlierMilesProgram = function (filter) {
        var name = $.trim(filter.replace('airline_tile_', '')),
            _name = name.replace('_', ' '),
            _fieldset = $('#AFFMP');
        if (_fieldset.attr('for') == name) return;
        $('input[name=airlineName]', _fieldset).val(_name);
        if (name) {
            $.ajax({
                method: "POST",
                url: "/user/checkAFFMP",
                data: {
                    airlineName: name.replace('_', ' ')
                }
            })
            .done(function( msg ) {
                if (msg && !msg.checked) {
                    $('#buy_button, #searchResultData, nav.navbar').addClass('hidden');
                    $('body').css('padding-top', 0);
                    _fieldset.removeClass('hidden');
                }
            });
        }

        _fieldset.attr('for', name);
    };

    $('#saveMilesPrograms').click(function () {
        var _fieldset = $('#AFFMP'),
            data = {
            airlineName:    $.trim($('input[name=airlineName]', _fieldset).val()),
            accountNumber:  $.trim($('input[name=accountNumber]', _fieldset).val()),
            flierMiles:     $.trim($('input[name=flierMiles]', _fieldset).val()),
            expirationDate: $.trim($('input[name=expirationDate]', _fieldset).val())
        };
        if (data.airlineName) {
            $.ajax({
                method: "POST",
                url:    "/user/addMilesPrograms",
                data:   data
            })
            .done(function( msg ) {
                if (msg.error) {
                    $('#timeAlert').text('Error saving data to Airlines Frequent Flier Miles Programs.')
                        .fadeIn('slow', function () {
                            $(this).fadeOut(5000, function () {
                                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20 ) + 'px');
                            });
                        }
                    );
                } else {
                    $('#timeAlert').text('Your data for Airlines Frequent Flier Miles Programs has been saved.')
                        .fadeIn('slow', function () {
                            $(this).fadeOut(5000, function () {
                                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20 ) + 'px');
                            });
                        }
                    );
                }
            });
        }
        cancelMilesPrograms();
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
                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20 ) + 'px');
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
                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) - 20) + 'px');
              });
            }
          );
        }
      });

  });

  var getIconForAirline = function (el) {
    var _image = new Image(),
      _code = el.data('code'),
      _file = '/images/airlines/' + _code + '.png';
    _image.onload = function () {
      el.attr('src', _file);
    };
    _image.src = _file;
  };

  $('.airlineIcon').each(function () {
    getIconForAirline($(this));
  });

  /* Depart/Return Date selection {{{ */

  // init datetimepickers {{{
  $('#depart_picker').datetimepicker({
    inline: true,
    format: "YYYY-MM-DD",
    minDate: moment(),
    defaultDate: $('#departureDate').val() || moment()
  });

  $('#return_picker').datetimepicker({
    inline: true,
    format: "YYYY-MM-DD",
    minDate: moment($('#depart_picker').data("DateTimePicker").date()),
    maxDate: moment().add(1, 'years'),
    defaultDate: $('#returnDate').val() || moment($('#depart_picker').data("DateTimePicker").date()).add(14, 'days')
  });
  // }}} datetimepickers

  // bind dp.change event {{{
  $("#depart_picker").on("dp.change", function (e) {
    $('#date_select p.info span.dep').text(moment(e.date).format('ddd DD MMM'));
    var dep_sel = $('.flight-date-info-item.sel.dep');
    $('.row:eq(1) > div:eq(0)', dep_sel).text(moment(e.date).format('DD MMM'));
    $('.row:eq(1) > div:eq(1)', dep_sel).html(moment(e.date).format('dddd<br>YYYY'));
    $('#return_picker').data("DateTimePicker").minDate(moment(e.date));
  });

  $("#return_picker").on("dp.change", function (e) {
    $('#date_select p.info span.ret').text(' - ' + moment(e.date).format('ddd DD MMM'));
    var ret_sel = $('.flight-date-info-item.sel.ret');
    $('.row:eq(1) > div:eq(0)', ret_sel).text(moment(e.date).format('DD MMM'));
    $('.row:eq(1) > div:eq(1)', ret_sel).html(moment(e.date).format('dddd<br>YYYY'));
  });
  // }}} bind dp.change event

  // bind date controls click event
  $('.flight-date-info-item').on('click', function () {
    $('#main_title').addClass('hidden');
    $('#main').addClass('hidden');
    $('#date_select').removeClass('hidden');
    $('#date_select_main').removeClass('hidden');
  });

  $('#date_select_top').on('click', function () {
    $('#main_title').removeClass('hidden');
    $('#main').removeClass('hidden');
    $('#date_select').addClass('hidden');
    $('#date_select_main').addClass('hidden');

    // cache values
    $('#departureDate').data('date', $('#depart_picker').data("DateTimePicker").date().format('YYYY-MM-DD'));
    $('#returnDate').data('date', $('#return_picker').data("DateTimePicker").date().format('YYYY-MM-DD'));

    changeFlightTab($('#search_form').data('flight-type'));
  });
  /* }}} Depart/Return Date selection */

  function changeFlightTab(type) {
    $('#search_form').data('flight-type', type);
    var hasFrom = !!$('#originAirport').val();
    var hasTo = !!$('#destinationAirport').val();
    switch (type) {
      case 'round_trip':
        $('.flight-direction-item-comming-soon').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        $('.flight-direction-item-arrow').html('&#8596;');
        if (hasFrom) {
          $('#from-area').addClass('hidden');
          $('#from-area-selected').removeClass('hidden');
        }
        if (hasTo) {
          $('#to-area').addClass('hidden');
          $('#to-area-selected').removeClass('hidden');
        }
        $('.flight-date-info').removeClass('hidden');
        if ($('#departureDate').data('date')) {
          $('#departureDate').val($('#departureDate').data('date'));
        }
        if (!!$('#departureDate').val()) {
          $('#departureDate').data('date', $('#departureDate').val());
          $('.flight-date-info-item.sel.dep').removeClass('hide');
          $('.flight-date-info-item.dep').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.dep').addClass('hide');
          $('.flight-date-info-item.dep').not('.sel').removeClass('hide');
        }
        if ($('#returnDate').data('date')) {
          $('#returnDate').val($('#returnDate').data('date'));
        }
        if (!!$('#returnDate').val()) {
          $('#returnDate').data('date', $('#returnDate').val());
          $('.flight-date-info-item.sel.ret').removeClass('hide');
          $('.flight-date-info-item.ret').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.ret').addClass('hide');
          $('.flight-date-info-item.ret').not('.sel').removeClass('hide');
        }
        $('#date_select_main .row.return').removeClass('hidden');
        $('#date_select p.header span.ret').removeClass('hidden');
        $('#date_select p.info span.ret').removeClass('hidden');
        $('.flight-additional-info').removeClass('hidden');
        break;
      case 'multi_city':
        $('.flight-direction-item-comming-soon').removeClass('hidden');
        $('.flight-direction-item').addClass('hidden');
        $('.flight-direction-item-arrow').addClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('#from-area-selected').addClass('hidden');
        $('#to-area-selected').addClass('hidden');
        $('.flight-date-info').addClass('hidden');
        $('.flight-additional-info').addClass('hidden');
        break;
      case 'one_way':
        $('.flight-direction-item-comming-soon').addClass('hidden');
        $('.flight-direction-item').removeClass('hidden');
        $('.flight-direction-item-arrow').removeClass('hidden');
        $('.flight-direction-item-arrow').html('&rarr;');
        if (hasFrom) {
          $('#from-area').addClass('hidden');
          $('#from-area-selected').removeClass('hidden');
        }
        if (hasTo) {
          $('#to-area').addClass('hidden');
          $('#to-area-selected').removeClass('hidden');
        }
        $('.flight-date-info').removeClass('hidden');
        if ($('#departureDate').data('date')) {
          $('#departureDate').val($('#departureDate').data('date'));
        }
        if (!!$('#departureDate').val()) {
          $('.flight-date-info-item.sel.dep').removeClass('hide');
          $('.flight-date-info-item.dep').not('.sel').addClass('hide');
        } else {
          $('.flight-date-info-item.sel.dep').addClass('hide');
          $('.flight-date-info-item.dep').not('.sel').removeClass('hide');
        }
        $('#returnDate').val('');
        $('.flight-date-info-item.sel.ret').addClass('hide');
        $('.flight-date-info-item').not('.sel').eq(1).addClass('hide');
        $('#date_select_main .row.return').addClass('hidden');
        $('#date_select p.header span.ret').addClass('hidden');
        $('#date_select p.info span.ret').addClass('hidden');
        $('.flight-additional-info').removeClass('hidden');
        break;
    }
  }


  $('.flight-type-item').on('click', function () {
    $('.flight-type-item').removeClass('active-choice');
    $(this).addClass('active-choice');
    var id = $(this).attr('id');
    changeFlightTab(id);
  });

  $('.flight-passengers-info-item .text-picker, #user-icon-small').on('click', function () {
    var currentValue = $('#passengers').val();

    if ( currentValue < 3 ) {
      currentValue++;
      $('.passengers_text').text('Adults');
    } else {
      currentValue = 1;
      $('.passengers_text').text('Adult');
    }
    $('#passengers').val(currentValue);
    $('.passengers_count').text(currentValue);
  });

  $('.flight-class-info-item .text-picker').on('click', function () {
    var currentValue = $('#preferedClass').val();
    var flagNext = false;
    var newValue = 'E';

    for(var idx in serviceClass) {
      if (flagNext) {
        newValue = idx;
        break;
      }
      if (idx == currentValue) {
        flagNext = true;
      }
    }
    $('#preferedClass').val(newValue);
    $(this).text(serviceClass[newValue]);
  });

  $('.flight-direction-item,.flight-direction-item-selected').on('click', function () {
    $('#main_title').addClass('hidden');
    $('#main').addClass('hidden');
    $('#search_title').removeClass('hidden');
    if ($(this).is('#from-area') || $(this).is('#from-area-selected')) {
      $('#airport-input').attr('target', 'originAirport');
    } else {
      $('#airport-input').attr('target', 'destinationAirport');
    }
  });

  $('#search_button_top').on('click', function () {
    $('#search_title').addClass('hidden');
    $('#main').removeClass('hidden');
    $('#main_title').removeClass('hidden');
    $('#airport-input').val('');
    $('#airport-input').typeahead('val','');
  });

  // search form init
  {
    // force dp.change event hook {{{
    $('#depart_picker').trigger({
      type: 'dp.change',
      date: $('#depart_picker').data("DateTimePicker").date(),
      oldDate: $('#depart_picker').data("DateTimePicker").date()
    });
    $('#return_picker').trigger({
      type: 'dp.change',
      date: $('#return_picker').data("DateTimePicker").date(),
      oldDate: $('#return_picker').data("DateTimePicker").date()
    });
    // }}} force dp.change event hook

    var choosenTab = $('.flight-type-item.active-choice').attr('id');
    changeFlightTab(choosenTab);
    drawAirportData('originAirport');
    drawAirportData('destinationAirport');
  }


});
