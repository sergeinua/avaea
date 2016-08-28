var Sorter = React.createClass({
  getInitialState: function() {

    var sortOptions = {
      price: {
        title: 'Price',
        current: true,
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
      }//,
      // {odepart: {
      //   title: 'Departure',
      //   current: false,
      //   order: 'asc'
      // }},
      // {oarrival: {
      //   title: 'Arrival',
      //   current: false,
      //   order: 'asc'
      // }}
    };
    if (InitResultData.searchParams.returnDate) {
      sortOptions.duration.title += '⇄';
      sortOptions.idepart = {
        title: InitResultData.searchParams.ArrivalLocationCode + ' ' + 'Departure',
        current: false,
        order: 'asc'
      };
      sortOptions.iarrival = {
        title: InitResultData.searchParams.DepartureLocationCode + ' ' + 'Arrival',
        current: false,
        order: 'asc'
      };
      sortOptions.odepart = {
        title: InitResultData.searchParams.DepartureLocationCode + ' ' + 'Departure',
        current: false,
        order: 'asc'
      };
      sortOptions.oarrival = {
        title: InitResultData.searchParams.ArrivalLocationCode + ' ' + 'Arrival',
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
  render: function() {
    var getOption = this.getOption;
    var current = Object.keys(this.state.sortOptions).filter(function(key) {return getOption(key).current});
    return (
      <div className="sort-button">
        <button className="btn dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span>{getOption(current).title}</span><span id="sort-menu-direction">&darr;</span>
        </button>
        <ul className="dropdown-menu">
          {Object.keys(this.state.sortOptions).map(function(key) {
            if (getOption(key)) {
              return <li key={key} className={getOption(key).current ? "selected" : ""} order={getOption(key).order}>
                <a href="#">{ getOption(key).title }</a>
              </li>
            }
            return '';
          })}
        </ul>
      </div>
    )
  }
});
