$(document).ready(function() {
    $('.mymorebutton').click(function(el) {
        $(this).addClass('hidden');
        var iterator = $(this).attr('for');
        $('.mymorecontent' + iterator).removeClass('hidden');
    });
});