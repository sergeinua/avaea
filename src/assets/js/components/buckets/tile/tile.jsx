var createMarkup = function(text) { return {__html: text}; };

var Tile = React.createClass({
  getInitialState: function() {
    return {
      tile: this.props.info
    };
  },
  render: function() {
    return (
          <div className="swiper-slide">
            <div className="mybucket" id="{ this.state.tile.id }">
              <div className="mycustomtab">{this.state.tile.name}</div>
              <ul className="list-group">
                { this.state.tile.filters.map( function (filter) {
                return <li data-for={filter.id} key={filter.id} className="list-group-item"><div className="text" dangerouslySetInnerHTML={createMarkup(filter.title)}/><span className="badge">{filter.count}</span></li>
              })}
              </ul>
            </div>
          </div>
    )
  }
});
