/* global $ */
$(document).ready(function() {

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

    $('.mymorebutton').click(function(el) {
        $(this).addClass('hidden');
        var iterator = $(this).attr('for');
        $('.mymorecontent' + iterator).removeClass('hidden');
    });

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
        $(clone).html(tileName + ':' + tileValue);

        $(clone).off().attr('itineraries', $(clone).attr('for'));
        $(clone).off().attr('for', $(this).parent().parent().attr('id'));

        $(clone).find('span').remove();
        $(clone).append($('<span class="badge" style="background-color:red;">&cross;</span>'));
        $(clone).find('span').click(function(e) {

            var target = $(this).parent().attr('for');
            var filters = $('.selectedfilters').attr('filters');
            filters = filters.split(' ');
            console.log(filters);
            var result = [];
            if (filters.length) {
              $('.itinerary').show();
              filters.forEach(function(filter) {
                if (filter && filter != $(clone).attr('itineraries') && filter != '') {
                  result.push(filter);
                  $('.itinerary:visible').not('.' + filter).hide();
                }
              });
              console.log(result);
              $('.selectedfilters').attr('filters', result.join(' '));
            }

            $(this).parent().remove();
            $('#' + target).hide();

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
    });

    var bestAirports = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        /*prefetch: '../data/films/post_1960.json',*/
        remote: {
            url: '/ac/airports?q=%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('#originAirport').typeahead({
      hint: true,
      highlight: true,
    }, {
        name: 'originAirport',
        hint: true,
        highlight: true,
        display: 'value',
        source: bestAirports,
        templates: {
            empty: [
                '<div class="empty-message">',
                'unable to find the airport that match the current query',
                '</div>'
            ].join('\n'),
            suggestion: function(vars) { return '<div>'+vars.city+', '+vars.name+' ('+vars.value+')</div>'; }/*Handlebars.compile('<div>{{city}}, {{name}} ({{value}})</div>')*/
        }
    });

    $('#destinationAirport').typeahead({
      hint: true,
      highlight: true,
    }, {
        name: 'destinationAirport',
        display: 'value',
        source: bestAirports,
        templates: {
            empty: [
                '<div class="empty-message">',
                'unable to find the airport that match the current query',
                '</div>'
            ].join('\n'),
            suggestion: function(vars) { return '<div>'+vars.city+', '+vars.name+' ('+vars.value+')</div>'; }/*Handlebars.compile('<div>{{city}}, {{name}} ({{value}})</div>')*/
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
        $('#buy_button').removeAttr('disabled');
    });

    $('#buy_button').click(function(event) {
        if ($('.itinerary+.selected')) {
            location.href = '/order';
        }
    });
});
