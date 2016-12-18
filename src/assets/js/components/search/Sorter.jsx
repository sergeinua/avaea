import React from 'react';
import { ActionsStore } from '../../functions.js';

let Sorter = React.createClass({
  getInitialState: function() {

    var sortOptions = {
      price: {
        title: 'Price',
        current: false,
        order: 'asc'
      },
      smart: {
        title: 'Smart Rank',
        current: false,
        order: 'asc'
      },
      duration: {
        title: 'Duration',
        current: false,
        order: 'asc'
      }
    };
    var searchParams = {};
    if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      searchParams = JSON.parse(localStorage.getItem('searchParams'));
    }
    if (searchParams.returnDate) {
      sortOptions.idepart = {
        title: searchParams.ArrivalLocationCode + ' ' + 'Departure',
        current: false,
        order: 'asc'
      };
      sortOptions.iarrival = {
        title: searchParams.DepartureLocationCode + ' ' + 'Arrival',
        current: false,
        order: 'asc'
      };
      sortOptions.odepart = {
        title: searchParams.DepartureLocationCode + ' ' + 'Departure',
        current: false,
        order: 'asc'
      };
      sortOptions.oarrival = {
        title: searchParams.ArrivalLocationCode + ' ' + 'Arrival',
        current: false,
        order: 'asc'
      };
    } else {
      sortOptions.odepart = {
        title: 'Departure',
        current: false,
        order: 'asc'
      };
      sortOptions.oarrival = {
        title: 'Arrival',
        current: false,
        order: 'asc'
      };
    }
    return {
      sortOptions: sortOptions
    }
  },

  getOption: function (key) {
    return this.state.sortOptions[key] || false;
  },

  sortItineraries: function (option, direction) {
    if (option == this.props.current.name) {
      direction = this.props.current.order == 'asc' ? 'desc' : 'asc';
    }
    return function() {
      ActionsStore.sortItineraries(option, direction);
    }.bind(this);
  },


  render: function() {
    var getOption = this.getOption;
    var sortItineraries = this.sortItineraries;
    var current = this.props.current;
    return (
      <div className="sort-button">
        <button className="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span>{getOption(current.name).title}</span>
          <span className={current.order == 'asc'? "arr-asc" : "arr-desc" }> </span>
        </button>
        <ul className="dropdown-menu">
          {Object.keys(this.state.sortOptions).map(function(key) {
            if (getOption(key)) {
              return <li key={key} className={key == current.name ? "selected" : ""} onClick={sortItineraries(key, getOption(key).order)}>
                <span>{ getOption(key).title }</span>
                {key == current.name?<span className={current.order == 'asc'? "arr-asc" : "arr-desc" }> </span> : null }
              </li>
            }
            return null;
          })}
        </ul>
      </div>
    )
  }
});

export default Sorter;
