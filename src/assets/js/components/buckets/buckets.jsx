var Buckets = React.createClass({
  getInitialState: function() {
    return {
      max_filter_items: this.props.max_filter_items || 0,
      tiles: this.props.tiles
    };
  },
  componentDidMount: function () {
    showTotal = !!$('.itinerary:visible').length;
    console.log('showTotal', showTotal);
    filterItineraries();
  },
  render: function() {
    return (
      <div className="swiper-container">
        <div id="tiles" className="swiper-wrapper" data-max_filter_items="{ this.props.max_filter_items }">
          {this.props.tiles.map(function(tile) {
            return <Tile key={tile.id} info={tile}/>
          })}
        </div>
        <div className="clickable-tiles-area clickable hidden"></div>
        <div className="clickable-tiles-area-yellow clickable"></div>
      </div>
    )
  }
});
