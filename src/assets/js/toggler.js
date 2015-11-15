/* global $ */
$(document).ready(function() {
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
    $('#returnDate').attr('min', new Date().toISOString().slice(0, 10));
    $('#departureDate').change(function() {
        $('#returnDate').attr('min', $('#departureDate').val());
    });

    //tiles
    $('.list-group-item').click(function(event) {
        $(this).parent().parent().fadeOut();
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
                console.log($(clone).attr('itineraries'));
                if (filter && filter != $(clone).attr('itineraries') && filter != '') {
                  result.push(filter);
                  $('.itinerary:visible').not('.' + filter).hide();
                }
              });
              console.log(result);
              $('.selectedfilters').attr('filters', result.join(' '));
            }

            $(this).parent().remove();
            $('#' + target).fadeIn();

            var sCount = $('.itinerary:visible').length;
            $('#search_count').text(sCount);

            $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');

        });
        $('.selectedfilters').append(clone);

        $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
    });

    $('#tiles').slick({
        dots: false,
        infinite: false,
        adaptiveHeight: true,
        slidesToShow: 3,
        slidesToScroll: 1
    });
    $('#originAirport, #destinationAirport').typeahead({
        source: function (query, process) {
            return $.post('/ac/airports?q=' + query, function (data) {
                return process(data);
            });
        }
    });

    //search count
    var sCount = $('.itinerary:visible').length;
    $('#search_count').text(sCount);
    if (sCount) {
      $('#search_count').removeClass('hidden');
      $('body').css('padding-top', ($('#tiles_ui').outerHeight(true) ) + 'px');
    }

});
