/* global $ */
$(document).ready(function() {

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
    $('.row:eq(0) > div:eq(0) > div:eq(1)', dep_sel).text(moment(e.date).format('dddd'));
    $('.row:eq(1) > div:eq(0)', dep_sel).text(moment(e.date).format('DD MMM'));
    $('.row:eq(1) > div:eq(1)', dep_sel).text(moment(e.date).format('YYYY'));
    $('#return_picker').data("DateTimePicker").minDate(moment(e.date));
  });

  $("#return_picker").on("dp.change", function (e) {
    $('#date_select p.info span.ret').text(' - ' + moment(e.date).format('ddd DD MMM'));
    var ret_sel = $('.flight-date-info-item.sel.ret');
    $('.row:eq(0) > div:eq(0) > div:eq(1)', ret_sel).text(moment(e.date).format('dddd'));
    $('.row:eq(1) > div:eq(0)', ret_sel).text(moment(e.date).format('DD MMM'));
    $('.row:eq(1) > div:eq(1)', ret_sel).text(moment(e.date).format('YYYY'));
  });
  // }}} bind dp.change event

  // bind date controls click event
  $('.flight-date-info-item').on('click', function () {
    heightNav = $('.navbar-header').outerHeight(true);
    $('.navbar-header').height('50px');
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

    if ($('.flight-date-info-item.ret').hasClass("error_elem")) {
      $('.flight-date-info-item.ret').removeClass("error_elem");
    }

    $('.navbar-header').height(heightNav);
    changeFlightTab($('#search_form').data('flight-type'));
  });
  /* }}} Depart/Return Date selection */

});