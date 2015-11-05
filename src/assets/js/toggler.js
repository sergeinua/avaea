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
});