import React from 'react';
import * as ReactRedux from 'react-redux';
import { ActionsStore, searchApiMaxDays } from '../../functions.js';
import moment from 'moment';

const $ = jQuery;

//FIXME get rid from jquery
const drawDateRange = function(datepicker, range) {
  if (!range.start || !range.end) {
    return;
  }
  let
    viewDate = $(datepicker).data("DateTimePicker").viewDate();
  // draw days range
  let days = $('td.day', datepicker);
  days.removeClass('active');
  days.removeClass('range');
  days.each(function (i, el) {
    let curDate = moment($(el).attr('data-day'), "L");
    if (curDate.isSame(range.start) || curDate.isSame(range.end)) {
      $(el).addClass('active');
    } else if (curDate.isAfter(range.start) && curDate.isBefore(range.end)) {
      $(el).addClass('range');
    }
  });
  // draw month range
  let months = $('.datepicker-months tbody span', datepicker);
  months.removeClass('active');
  months.removeClass('range');
  months.each(function (i, el) {
    let m = (i+1) + '';
    if (m.length < 2) {
      m = '0' + m;
    }
    let curMonth = viewDate.format('YYYY') + m;
    if ((parseInt(range.start.format('YYYYMM')) == curMonth) || (parseInt(range.end.format('YYYYMM')) == curMonth)) {
      $(el).addClass('active');
    }
    if (curMonth > parseInt(range.start.format('YYYYMM')) && curMonth < parseInt(range.end.format('YYYYMM'))) {
      $(el).addClass('range');
    }
  });
  // draw years range
  let years = $('.datepicker-years tbody span', datepicker);
  years.removeClass('active');
  years.removeClass('range');
  years.each(function (i, el) {
    let curYear = parseInt($(el).text());
    if ((parseInt(range.start.format('YYYY')) == curYear) || (parseInt(range.end.format('YYYY')) == curYear)) {
      $(el).addClass('active');
    }
    if (curYear > parseInt(range.start.format('YYYY')) && curYear < parseInt(range.end.format('YYYY'))) {
      $(el).addClass('range');
    }
  });
};

export function finalizeValues(searchParams) {
  let picker = $('#dr_picker');
  let flightType = searchParams.flightType,
    moment_dp = picker.data("DateTimePicker").date(),
    moment_rp = null;

  if (flightType == 'round_trip') {
    moment_dp = picker.data("DateTimePicker").range.start;
    moment_rp = picker.data("DateTimePicker").range.end;
  }

  // cache values
  ActionsStore.setFormValue('departureDate', moment_dp.format('YYYY-MM-DD'));
  ActionsStore.setFormValue('returnDate', (flightType == 'round_trip' && moment_rp) ? moment_rp.format('YYYY-MM-DD') : null);

  ActionsStore.changeForm(flightType);
}


const Calendar = React.createClass({
  componentDidMount: function () {
    let picker = $('#dr_picker');

    let flightType = this.props.searchParams.flightType || 'round_trip',
      calendarType = this.props.calendarType || 'dep';

    // init datetimepicker {{{
    if (picker.length) {
      let curMoment = moment(0, "HH");
      picker.datetimepicker({
        inline: true,
        format: "YYYY-MM-DD",
        minDate: curMoment.clone().startOf('day'),
        maxDate: curMoment.clone().add(searchApiMaxDays, 'days').subtract(1, 'seconds')
      });
      // extends "clear" datepicker method, adding possibility to clear range
      let dpPxClear = picker.data("DateTimePicker").clear;
      picker.data("DateTimePicker").clear = function () {
        this.range = {
          start: null,
          end: null
        };
        $('.range', '#dr_picker').removeClass('range');
        return dpPxClear.apply(this);
      };
      // initially clear datepicker state
      picker.data("DateTimePicker").clear();
    }
    // }}} init datetimepicker

    picker.on("dp.change", function (e) {
      if (e.date) {
        let btn_container = $('#date_select');
        let eDate = moment(e.date).startOf('day');
        if (flightType == 'round_trip') {
          // enable range functionality for round trip flight type

          // range manipulation {{{
          let range = $(this).data("DateTimePicker").range;
          if (!range.start || !range.end) {
            if (range.start && !range.end && eDate.isSameOrAfter(range.start)) {
              range.end = eDate;
            } else {
              range.start = eDate;
              range.end = null;
            }
          } else {
            if (calendarType == 'dep') {
              if (eDate.isSameOrBefore(range.end)) {
                range.start = eDate;
              }
            }
            if (calendarType == 'ret') {
              if (eDate.isSameOrAfter(range.start)) {
                range.end = eDate;
              }
            }
          }
          // }}} range manipulation

          // draw new date range
          drawDateRange(this, range);
          // draw info bar dates
          btn_container.find('.info .dep').text(range.start.format('DD MMM ddd'));
          btn_container.find('.info .ret').text(range.end ? range.end.format('DD MMM ddd') : '');
        } else if (flightType == 'one_way') {
          btn_container.find('.info .dep').text(eDate.format('DD MMM ddd'));
        }
      }
    });

    picker.on("dp.update", function (e) {
      // redraw date range on each picker update
      drawDateRange(this, $(this).data("DateTimePicker").range);
    });

    picker.hammer().bind("swipeleft", function (e) {
      $(this).data("DateTimePicker").next();
    }).bind("swiperight", function (e) {
      $(this).data("DateTimePicker").previous();
    });

    picker.data("DateTimePicker").clear();
    let depDate = this.props.searchParams.departureDate ? moment(this.props.searchParams.departureDate, 'YYYY-MM-DD').startOf('day') : moment().startOf('day');
    picker.data("DateTimePicker").date(depDate);

    // force dp.change event hook for round trip {{{
    if (flightType == 'round_trip') {
      let retDate = this.props.searchParams.returnDate ? moment(this.props.searchParams.returnDate, 'YYYY-MM-DD').startOf('day') : depDate.clone().add(14, 'days');
      if (retDate.isAfter(picker.data("DateTimePicker").maxDate())) {
        retDate = picker.data("DateTimePicker").maxDate().clone().startOf('day');
      }
      if (calendarType == 'dep') {
        picker.data("DateTimePicker").maxDate(retDate.clone().add(1, 'days').subtract(1, 'seconds'));
      } else if (calendarType == 'ret') {
        picker.data("DateTimePicker").minDate(depDate.clone().startOf('day'));
      }
      picker.trigger({
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
        {this.props.searchParams.flightType == 'round_trip' ? <div className="message info">
            Select {this.props.calendarType == 'dep' ? "departure" : "return"} date.
        </div> : null}
        <div className="row">
          <div className="row">
            <div id="dr_picker"></div>
          </div>
        </div>
      </div>
    )
  }
});

const mapStateCommon = function(store) {
  return {
    calendarType: store.commonData.calendarType,
    searchParams: store.commonData.searchParams,
  };
};

const CalendarContainer = ReactRedux.connect(mapStateCommon)(Calendar);

export default CalendarContainer;
