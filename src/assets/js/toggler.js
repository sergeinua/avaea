/* global $ */
$(document).ready(function() {

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
            console.log( "Data Saved: " + msg );
        });
    }

    //tile recalculation
    var recalcTiles = function () {
        $('#tiles').find('li').each(function(item) {
            var tile = $(this);
            var sCount = $('.' + tile.attr('for') + ':visible').length;
            if ( sCount > 0 ) {
                $('[for='+tile.attr('for')+'] > span').text(sCount);
                tile.removeClass('disabled');
            } else {
                $('[for='+tile.attr('for')+'] > span').text('');
                tile.addClass('disabled');
            }
        });
        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
    }

    $('.mymoreprofilebutton').click(function(el) {
        var cloneTarget = $(this).attr('for');
        var clone = $('#' + cloneTarget).clone().find("input").val("").end();

        clone.find('hr').removeClass('hidden');
        clone.appendTo($('#' + cloneTarget).parent());
        return false;
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
        $(this).parent().parent().hide();
        var clone = $(this).clone();

        var tileName = $(this).parent().parent().find('a').text();
        var tileValue = $(clone).html();
        $('.itinerary:visible').not('.' + $(clone).attr('for')).hide();
        var filters = $('.selectedfilters').attr('filters');
        $('.selectedfilters').attr('filters', filters + ' ' + $(clone).attr('for'));

        // recalculate search result
        var sCount = $('.itinerary:visible').length;
        $('#search_count').text(sCount);
        $('#search_count').removeClass('hidden');

        $(clone).find('span').remove();

        logAction('on_tile_choice', {
            action    : 'filter_add',
            tileName  : tileName,
            tileValue : $(clone).html(),
            tileId    : $(clone).attr('for')
        })

        $(clone).html(tileName + ':' + tileValue);

        $(clone).find('span').remove();
        $(clone).off().attr('itineraries', $(clone).attr('for'));
        $(clone).off().attr('for', $(this).parent().parent().attr('id'));

        $(clone).append($('<span class="badge" style="background-color:red;">&cross;</span>'));
        $(clone).find('span').click(function(e) {

            var target = $(this).parent().attr('for');
            var filters = $('.selectedfilters').attr('filters');
            filters = filters.split(' ');

            var tileData = $(this).parent().text().slice(0, -1).split(':');

            logAction('on_tile_choice', {
                action    : 'filter_remove',
                tileName  : tileData[0],
                tileValue : tileData[1],
                tileId    : target
            })

            var result = [];
            if (filters.length) {
              $('.itinerary').show();
              filters.forEach(function(filter) {
                if (filter && filter != $(clone).attr('itineraries') && filter != '') {
                  result.push(filter);
                  $('.itinerary:visible').not('.' + filter).hide();
                }
              });

              $('.selectedfilters').attr('filters', result.join(' '));
            }

            $(this).parent().remove();
            $('#' + target).show();

            var sCount = $('.itinerary:visible').length;
            $('#search_count').text(sCount);

            recalcTiles();
        });
        $('.selectedfilters').append(clone);

        recalcTiles();
    });

    var getSliderSettings = function() {
        return {
            dots: false,
            infinite: false,
            mobileFirst: true,
            adaptiveHeight: true,
            slidesToShow: Math.floor($('body').outerWidth(true)/150),
            slidesToScroll: 1
        }
    }
    $('#tiles').slick(getSliderSettings());
    $( window ).resize(function() {
        $('#tiles').slick('unslick');
        $('#tiles').slick(getSliderSettings());
        $('.selectedfilters > li').each(function(index) {
            var target = $(this).attr('for');
            $('#' + target).hide();
        })
    });

    $('#originAirport, #destinationAirport').typeahead({
      hint: true,
      highlight: true,
      minLength: 2
    }, {
        name: 'airports',
        display: 'value',
        limit: 8,
        source: new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            /*prefetch: '/ac/airports',*/
            remote: {
                url: '/ac/airports?q=%QUERY',
                wildcard: '%QUERY'
            }
        }),
        templates: {
            empty: [
                '<div class="empty-message">',
                'unable to find the airport that match the current query',
                '</div>'
            ].join('\n'),
            suggestion: function(vars) { return '<div>'+vars.city+', '+vars.name+' ('+vars.value+')</div>'; }
        }
    });
    $('.tt-hint').addClass('form-control');

    //search count
    var sCount = $('.itinerary:visible').length;
    $('#search_count').text(sCount);
    if (sCount) {
      $('#search_count').removeClass('hidden');
      $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
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
            logAction('on_itinerary_purchase', {
                action    : 'itinerary_expanded',
                itinerary : {
                    id : itineraryId
                }
            })
          }
        }

        $('#buy_button').removeAttr('disabled');
    });

    $('#buy_button').click(function(event) {
        if ($('.selected')) {
            location.href = '/order?id=' + $('.selected').attr('id');
        }
    });
});
