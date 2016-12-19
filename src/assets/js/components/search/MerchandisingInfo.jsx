var MerchandisingInfo = React.createClass({
  getInitialState: function() {
    var merch = [];
    this.props.flights.map(function (flight) {
      if (typeof flight.merchandising !== "undefined") {
        flight.merchandising.map(function (item) {
          var merchKey = item.toLowerCase().replace(/\W+/g, '_'),
            merchClass;
          if (merchKey == '1st_bag_free') {
            merchClass = 'luggage';
          } else if (merchKey == 'wifi') {
            merchClass = 'wifi';
          } else if (merchKey == 'priority_seat') {
            merchClass = 'priority_seat';
          } else {
            merchClass = '';
          }
          merch.push({name: item, class:merchClass});
        });
      }
    });

    return {
      information: merch
    };
  },
  render: function() {
    return (
      <ul className="merchandising">
        {this.state.information.map(function(info, i) {
          return <li key={i}>{info.class ? <span className={"gicon " + info.class} title={info.name}></span>:<span>{info.name}</span>}</li>
        })}
      </ul>
    )
  }
});
