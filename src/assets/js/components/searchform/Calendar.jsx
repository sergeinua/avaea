import React from 'react';
import { ActionsStore, searchApiMaxDays } from '../../functions.js';
import moment from 'moment';

//FIXME get rid from jquery
var drawDateRange = function(datepicker, range) {
  if (!range.start || !range.end) {
    return;
  }
  var
    viewDate = $(datepicker).data("DateTimePicker").viewDate();
  // draw days range
  var days = $('td.day', datepicker);
  days.removeClass('active');
  days.removeClass('range');
  days.each(function (i, el) {
    var curDate = moment($(el).attr('data-day'), "L");
    if (curDate.isSame(range.start) || curDate.isSame(range.end)) {
      $(el).addClass('active');
    } else if (curDate.isAfter(range.start) && curDate.isBefore(range.end)) {
      $(el).addClass('range');
    }
  });
  // draw month range
  var months = $('.datepicker-months tbody span', datepicker);
  months.removeClass('active');
  months.removeClass('range');
  months.each(function (i, el) {
    var m = (i+1) + '';
    if (m.length < 2) {
      m = '0' + m;
    }
    var curMonth = viewDate.format('YYYY') + m;
    if ((parseInt(range.start.format('YYYYMM')) == curMonth) || (parseInt(range.end.format('YYYYMM')) == curMonth)) {
      $(el).addClass('active');
    }
    if (curMonth > parseInt(range.start.format('YYYYMM')) && curMonth < parseInt(range.end.format('YYYYMM'))) {
      $(el).addClass('range');
    }
  });
  var years = $('.datepicker-years tbody span', datepicker);
  years.removeClass('active');
  years.removeClass('range');
  years.each(function (i, el) {
    var curYear = parseInt($(el).text());
    if ((parseInt(range.start.format('YYYY')) == curYear) || (parseInt(range.end.format('YYYY')) == curYear)) {
      $(el).addClass('active');
    }
    if (curYear > parseInt(range.start.format('YYYY')) && curYear < parseInt(range.end.format('YYYY'))) {
      $(el).addClass('range');
    }
  });
};

export function finalizeValues(searchParams) {
  var flightType = searchParams.flightType;

  var moment_dp = $('#dr_picker').data("DateTimePicker").date();
  var moment_rp = null;
  if (flightType == 'round_trip') {
    moment_dp = $('#dr_picker').data("DateTimePicker").range.start;
    moment_rp = $('#dr_picker').data("DateTimePicker").range.end;
  }

  // cache values
  ActionsStore.setFormValue('departureDate', moment_dp.format('YYYY-MM-DD'));
  ActionsStore.setFormValue('returnDate', (flightType == 'round_trip' && moment_rp) ? moment_rp.format('YYYY-MM-DD') : null);

  ActionsStore.changeForm(flightType);
}


var Calendar = React.createClass({
  componentDidMount: function () {

    // init datetimepicker {{{
    if ($('#dr_picker').length) {
      var curMoment = moment(0, "HH");
      $('#dr_picker').datetimepicker({
        inline: true,
        format: "YYYY-MM-DD",
        minDate: curMoment.clone(),
        maxDate: curMoment.clone().add(searchApiMaxDays, 'days').subtract(1, 'seconds')

      });
      // extends "clear" datepicker method, adding possibility to clear range
      var dpPxClear = $('#dr_picker').data("DateTimePicker").clear;
      $('#dr_picker').data("DateTimePicker").clear = function () {
        this.range = {
          start: null,
          end: null
        };
        $('.range', '#dr_picker').removeClass('range');
        return dpPxClear.apply(this);
      };
      // initially clear datepicker state
      $('#dr_picker').data("DateTimePicker").clear();
    }
    // }}} init datetimepicker

    var _self = this;
    $("#dr_picker").on("dp.change", function (e) {
      if (e.date) {
        var flightType = _self.props.searchParams.flightType || 'round_trip';
        // enable range functionality for round trip flight type
        if (flightType == 'round_trip') {
          // range manipulation {{{
          var range = $(this).data("DateTimePicker").range;
          if (range.start && !range.end && e.date.isAfter(range.start)) {
            range.end = e.date.clone().startOf('day');
          } else {
            range.start = e.date.clone().startOf('day');
            range.end = null;
          }
          // }}} range manipulation
          // draw new date range
          drawDateRange(this, range);
          // draw info bar dates
          $('#date_select .info .dep').text(range.start.format('DD MMM ddd'));
          $('#date_select .info .ret').text(range.end ? moment(e.date).format('DD MMM ddd') : '');
          // setDisplayedDate($('.flight-date-info-item.dep'), range.start);
          if (range.end) {
            // setDisplayedDate($('.flight-date-info-item.ret'), range.end);
          }
        } else if (flightType == 'one_way') {
          $('#date_select .info .dep').text(moment(e.date).format('DD MMM ddd'));
        } else {
          // setDisplayedDate($('.flight-date-info-item.dep'), e.date);
        }
      }
    });

    $("#dr_picker").on("dp.update", function (e) {
      // redraw date range on each picker update
      drawDateRange(this, $(this).data("DateTimePicker").range);
    });

    $("#dr_picker").hammer().bind("swipeleft", function (e) {
      $(this).data("DateTimePicker").next();
    }).bind("swiperight", function (e) {
      $(this).data("DateTimePicker").previous();
    });

    // force dp.change event hook {{{
    $('#dr_picker').data("DateTimePicker").clear();
    var depDate = this.props.searchParams.departureDate ? moment(this.props.searchParams.departureDate, 'YYYY-MM-DD') : moment();
    $('#dr_picker').data("DateTimePicker").date(depDate);

    if (this.props.searchParams.flightType == 'round_trip') {
      var retDate = this.props.searchParams.returnDate ? moment(this.props.searchParams.returnDate, 'YYYY-MM-DD') : depDate.clone().add(14, 'days');
      if (retDate.isAfter($('#dr_picker').data("DateTimePicker").maxDate())) {
        retDate = $('#dr_picker').data("DateTimePicker").maxDate().clone();
      }
      $('#dr_picker').trigger({
        type: 'dp.change',
        date: retDate,
        oldDate: depDate
      });
    }
    // }}} force dp.change event hook
  },

  render() {
    return (
      <div id="date_select_main" className="clearfix calendar-panel">
        <div className="row">
          <div className="row">
            <div id="dr_picker"></div>
          </div>
        </div>
      </div>
    )
  }
});

export default Calendar;
