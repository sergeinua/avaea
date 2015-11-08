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
        var top = $('body').css('padding-top');
        $('body').css('padding-top', (parseInt(top) + 20) + 'px');

        var tileName = $(this).parent().parent().find('a').text();
        var tileValue = $(clone).html();
        $(clone).html(tileName + ':' + tileValue);

        $(clone).off().attr('for', $(this).parent().parent().attr('id'));
        $(clone).find('span').remove();
        $(clone).append($('<span class="badge" style="background-color:red;">&cross;</span>'));
        $(clone).find('span').click(function(e) {
            var top = $('body').css('padding-top');
            $('body').css('padding-top', (parseInt(top) - 20) + 'px');

            var target = $(this).parent().attr('for');
            $(this).parent().remove();
            $('#' + target).fadeIn();
        });
        $('.selectedfilters').append(clone);
    });

    $('#tiles').slick({
        dots: false,
        infinite: false,
        adaptiveHeight: true,
        slidesToShow: 3,
        slidesToScroll: 1
    });
});