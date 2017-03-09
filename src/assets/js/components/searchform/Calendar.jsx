import React from 'react';
import * as ReactRedux from 'react-redux';
import { ActionsStore, searchApiMaxDays, getDefaultDateSearch } from '../../functions.js';
import moment from 'moment';

const $ = jQuery;

export function finalizeValues(searchParams) {
  //FIXME get rid from jquery
  let picker = $('#dr_picker');

  let flightType = searchParams.flightType,
    mDep = picker.data("DateTimePicker").date(),
    mRet = null;

  if (flightType == 'round_trip') {
    let range = picker.data("DateTimePicker").range;
    mDep = range.start;
    mRet = range.end;
  }

  // cache values
  ActionsStore.setFormValue('departureDate', mDep ? mDep.format('YYYY-MM-DD') : null);
  ActionsStore.setFormValue('returnDate', (flightType == 'round_trip' && mRet) ? mRet.format('YYYY-MM-DD') : null);

  ActionsStore.changeForm(flightType);
}


const Calendar = React.createClass({
  componentDidMount: function () {
    //FIXME get rid from jquery
    let picker = $('#dr_picker');

    let flightType = this.props.searchParams.flightType || 'round_trip',
      calendarType = this.props.calendarType || 'dep';

    //FIXME get rid from jquery
    const drawDateRange = function(range) {
      // this is not independent method, use this function in the context of the calendar picker element only via call or apply
      if (!this || !range.start || !range.end) {
        return;
      }
      let viewDate = $(this).data("DateTimePicker").viewDate();
      // draw days range
      let days = $('td.day', this);
      days.removeClass('active');
      days.removeClass('range');
      days.removeClass('error');
      days.each(function (i, el) {
        let curDate = moment($(el).attr('data-day'), "L").startOf('day');
        if (curDate.isSame(range.start) || curDate.isSame(range.end)) {
          $(el).addClass('active');
          if (range.end.isBefore(range.start)) {
            if (calendarType == 'dep') {
              if (curDate.isSame(range.end)) {
                $(el).addClass('error');
              } else {
                $(el).removeClass('error');
              }
            }
            if (calendarType == 'ret') {
              if (curDate.isSame(range.start)) {
                $(el).addClass('error');
              } else {
                $(el).removeClass('error');
              }
            }
          }
        } else if (curDate.isAfter(range.start) && curDate.isBefore(range.end)) {
          $(el).addClass('range');
        } else if (curDate.isAfter(range.end) && curDate.isBefore(range.start)) {
          $(el).addClass('range error');
        }
      });
      // draw month range
      let months = $('.datepicker-months tbody span', this);
      months.removeClass('active');
      months.removeClass('range');
      months.removeClass('error');
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
      let years = $('.datepicker-years tbody span', this);
      years.removeClass('active');
      years.removeClass('range');
      years.removeClass('error');
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

    // init datetimepicker {{{
    if (picker.length) {


      let curMoment = moment(0, "HH");
      picker.datetimepicker({
        inline: true,
        format: "YYYY-MM-DD",
        minDate: calendarType == 'ret' ? this.props.searchParams.departureDate : curMoment.clone().startOf('day'),
        maxDate: curMoment.clone().add(searchApiMaxDays - 1, 'days').endOf('day')
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
        //FIXME get rid from jquery
        let info_container = $('#date_select');

        let eDate = moment(e.date).startOf('day');
        if (flightType == 'round_trip') {
          // enable range functionality for round trip flight type

          // range manipulation {{{
          let range = $(this).data("DateTimePicker").range;
          if (calendarType == 'dep') {
            range.start = eDate;
          }
          if (calendarType == 'ret') {
            range.end = eDate;
          }
          // }}} range manipulation

          // draw new date range
          drawDateRange.call(this, range);
          // draw info bar dates
          //FIXME get rid from jquery
          if (range.start) {
            info_container.find('.info .dep').removeClass('hidden').text(range.start.format('DD MMM ddd'));
          } else {
            info_container.find('.info .dep').addClass('hidden');
          }
          if (range.end) {
            info_container.find('.info .ret').removeClass('hidden').text(range.end ? range.end.format('DD MMM ddd') : '');
          } else {
            info_container.find('.info .ret').addClass('hidden');
          }
        } else if (flightType == 'one_way') {
          //FIXME get rid from jquery
          info_container.find('.info .dep').removeClass('hidden').text(eDate.format('DD MMM ddd'));
        }
      }
    });

    picker.on("dp.update", function (e) {
      // redraw date range on each picker update
      drawDateRange.call(this, $(this).data("DateTimePicker").range);
    });

    picker.hammer().bind("swipeleft", function (e) {
      //FIXME get rid from jquery
      $(this).data("DateTimePicker").next();
    }).bind("swiperight", function (e) {
      //FIXME get rid from jquery
      $(this).data("DateTimePicker").previous();
    });

    picker.data("DateTimePicker").clear();

    // get current dates
    let dates = {
      departureDate: this.props.searchParams.departureDate || null,
      returnDate: this.props.searchParams.returnDate || null
    };
    // filter dates
    dates = getDefaultDateSearch(dates);

    if (!dates.departureDate) {
      dates.departureDate = dates.returnDate;
    }
    if (!dates.returnDate) {
      dates.returnDate = dates.departureDate;
    }
    // init date picker values id at least departureDate is defined
    if (dates.departureDate) {
      let mDep = moment(dates.departureDate, 'YYYY-MM-DD').startOf('day'),
          mRet = moment(dates.returnDate, 'YYYY-MM-DD').startOf('day');
      // prevent selection before minDate
      if (mDep.isBefore(picker.data("DateTimePicker").minDate())) {
        mDep = picker.data("DateTimePicker").maxDate().clone().startOf('day');
      }
      // prevent selection after maxDate
      if (mRet.isAfter(picker.data("DateTimePicker").maxDate())) {
        mRet = picker.data("DateTimePicker").maxDate().clone().startOf('day');
      }
      if (flightType == 'round_trip') {
        // set picker range for round trip
        picker.data("DateTimePicker").range = {
          start: mDep.clone(),
          end: mRet.clone()
        };
      }
      if (calendarType == 'dep') {
        // set departure date as picker date
        picker.data("DateTimePicker").date(mDep);
      }
      if (calendarType == 'ret') {
        // set return date as picker date
        picker.data("DateTimePicker").date(mRet);
      }
    }
  },

  render() {
    return (
      <div id="date_select_main" className="clearfix calendar-panel">
        {this.props.searchParams.flightType == 'round_trip' ? <div className="message info">
            Select {this.props.calendarType == 'ret' ? "return" : "departure"} date.
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
