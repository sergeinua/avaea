/* global $ */
$(document).ready(function() {
    $('#timeAlert').fadeOut(5000, function () {
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
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
        $('#tiles').find('li').each(function(item) {
            var tile = $(this);
            var sCount = 0;
            if (tile.hasClass('selected')) {
                sCount = $('.' + tile.attr('for') + ':visible').length;
            } else {
                sCount = $('.' + tile.attr('for') + ':visible').length;
                var filters = $('.selectedfilters').attr('filters');
                if (tile.attr('for')) {
                    var tileGroup = tile.attr('for').replace(/(tile).+/, '$1');
                    var total = 0;
                    var subs = 0;

                    if (filtersCount[tileGroup] > 0) {
                        subs = filtersCount[tileGroup];
                        console.log('subs:', subs);
                    }
                    $.each(filtersCount, function() {
                        total += this;
                    });
                    console.log('tileGroupCount:',filtersCount, 'total:', total);
                    var filtered = filters.match(tileGroup);

                    if (filtered) {
                        total -= subs;
                        sCount = '+'+($('.' + tile.attr('for')).length - total - $('.' + tile.attr('for') + ':visible').length);
                    }
                }
            }
            if ( sCount > 0 ) {
                $('[for='+tile.attr('for')+'] > span.badge').text(sCount);
                tile.removeClass('disabled');
            } else if ( sCount < 0 ) {
                $('[for='+tile.attr('for')+'] > span.badge').text('');
                tile.addClass('disabled');
            }
        });
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
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
        filterItineraries();
    });

    $('#undo').click(function() {
        var filters = $('.selectedfilters').attr('filters');
        filters = filters.split(' ');
        if (filters.length) {
            var lastElement = filters[filters.length - 1];
            filters.pop();
            $('.selectedfilters').attr('filters', filters.join(' '));
            $('[for='+lastElement+']').removeClass('selected');
            filterItineraries();
        }
    });

    $('.mymoreprofilebutton').click(function(el) {
        var cloneTarget = $(this).attr('for');
        var clone = $('#' + cloneTarget).clone().find("input").val("").end();

        clone.find('hr').removeClass('hidden');
        clone.appendTo($('#' + cloneTarget).parent());
        return false;
    });

    $('.mymorebutton').click(function(el) {
        var _it = $(this).attr('for');
        $('.mymorecontent' + _it).toggleClass('hidden');
        return false;
    });

    $('.recommended').each(function(item){
        $(this).find('div:first').find('div:first').find('div:first')
        .append($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
    });
    //set defaults
    $('#departureDate').attr('min', new Date().toISOString().slice(0, 10));
    $('#returnDate').attr('min', $('#departureDate').val());
    $('#departureDate').change(function() {
        $('#returnDate').attr('min', $('#departureDate').val());
    });

    //tiles
    $('.list-group-item').click(function(event) {
        if ($(this).hasClass('disabled')) {
            return false;
        }
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            var filters = $('.selectedfilters').attr('filters');
            filters = filters.split(' ');

            logAction('on_tile_choice', {
                action    : 'filter_remove',
                tileName  : $(this).parent().parent().find('a').attr('id'),
                tileValue : $(this).html(),
                tileId    : $(this).attr('for')
            });
            var result = [];
            var current = $(this).attr('for');
            if (filters.length) {
//              $('.itinerary').show();
              filters.forEach(function(filter) {
                if (filter && filter != current && filter != '') {
                  result.push(filter);
//                  $('.itinerary:visible').not('.' + filter).hide();
                }
              });

              $('.selectedfilters').attr('filters', result.join(' '));
            }
        } else {
            $(this).addClass('selected');
//            $('.itinerary:visible').not('.' + $(this).attr('for')).hide();
            var filters = $('.selectedfilters').attr('filters');
            $('.selectedfilters').attr('filters', filters + ' ' + $(this).attr('for'));
            // recalculate search result
            // log to abo
            logAction('on_tile_choice', {
                action    : 'filter_add',
                tileName  : $(this).parent().parent().find('a').attr('id'),
                tileValue : $(this).html(),
                tileId    : $(this).attr('for')
            });

            var current = $(this).attr('for');
            if (current && current.indexOf('airline_tile') != -1) {
                checkAirlineFlierMilesProgram(current);
            }
        }
//        var sCount = $('.itinerary:visible').length;
//        $('#search_count').text(sCount);
//        $('#search_count').removeClass('hidden');
        filterItineraries();
    });

    var getSliderSettings = function() {
        return {
            dots: true,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            adaptiveHeight: true,
            slidesToShow: Math.min(Math.floor($('body').outerWidth(true)/100), $('.mybucket').length),
            slidesToScroll: 1,
            appendArrows: $('.myarr'),
            focusOnSelect: true
        }
    };
    $('#tiles').slick(getSliderSettings());
    $( window ).resize(function() {
        $('#tiles').slick('unslick');
        $('#tiles').slick(getSliderSettings());
        $('.selectedfilters > li').each(function(index) {
            var target = $(this).attr('for');
            $('#' + target).hide();
        })
    });


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
                    //console.log("SUCCESS %o", msg);
                    cb(msg ? msg : []);
                })
                .fail(function (msg) {
                    cb([{city: "System error", name: "please try later", value: "---"}]);
                });
        };
    };

    $('#originAirport, #destinationAirport').typeahead({
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
        $('#search_button').hide();
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

        $('#buy_button').removeAttr('disabled');
    });

    $('#buy_button').click(function(event) {
        if ($('.selected')) {
            location.href = '/order?id=' + $('.selected').attr('id');
        }
    });

    $("#cancelMilesPrograms").click(function () {
        cancelMilesPrograms();
    });

    var cancelMilesPrograms = function () {
        $('#AFFMP').addClass('hidden');
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true)) + 'px');
        $('#buy_button').removeClass('hidden');
        $('#tiles_ui').css('display', 'table');
        var _fieldset = $('#AFFMP');
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
                    $('#buy_button').addClass('hidden');
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
                                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
                            });
                        }
                    );
                } else {
                    $('#timeAlert').text('Your data for Airlines Frequent Flier Miles Programs has been saved.')
                        .fadeIn('slow', function () {
                            $(this).fadeOut(5000, function () {
                                $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
                            });
                        }
                    );
                }
            });
        }
        cancelMilesPrograms();
    });
});
