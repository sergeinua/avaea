var Buckets = React.createClass({
  getInitialState: function() {
    return {
      max_filter_items: this.props.max_filter_items || 0,
      searchResultLength: this.props.searchResultLength,
      tiles: this.props.tiles,
      fullinfo: true,
    };
  },

  handleUndo: function () {
    return function() {
      if (this.props.searchResultLength != this.state.searchResultLength) {
        SearchForm.undoTiles();
      }
    }.bind(this);
  },

  handleClear: function () {
    return function() {
      if (this.props.searchResultLength != this.state.searchResultLength) {
        SearchForm.clearTiles();
      }
    }.bind(this);
  },

  toggleFullInfo: function () {
    SearchForm.toggleFullInfo = (value) => {
      $('body').removeClass('show-tiles-arrow');
      var newVal = (typeof value != 'undefined')?value:!this.state.fullinfo;
      this.setState({fullinfo: newVal});
    };
    return function() {
      SearchForm.toggleFullInfo();
    }.bind(this);
  },

  render: function() {
    return (
    <div>

        <div className={this.state.fullinfo ? "swiper-container":"swiper-container hidden"}>
          <div id="tiles" className="swiper-wrapper" data-max_filter_items={ this.props.max_filter_items }>
            {this.state.tiles.map(function (tile) {
              return <Tile key={tile.id} info={tile} />
            })}
          </div>
          <div className="clickable-tiles-area clickable hidden"></div>
          <div className="clickable-tiles-area-yellow clickable"></div>
        </div>

      <div className="bottomNav">
        <div className="bottom-nav-text">
        <span>Showing <span className='search_count'><span id='search_count'>{ this.props.searchResultLength }</span>/{this.state.searchResultLength} </span></span>
        Flights by </div><Sorter current={this.props.currentSort}/>
        <div className="clear-undo-buttons text-right">
          <span id="clear" className="clear-all-filters" onClick={this.handleClear()}>Clear</span>|
          <span id="undo" className="undo-button" onClick={this.handleUndo()}>Undo</span>
          <span className={!this.state.fullinfo ?"glyphicon glyphicon-triangle-bottom":"glyphicon glyphicon-triangle-top"} onClick={this.toggleFullInfo()}></span>
        </div>
      </div>
    </div>

    )
  }
});
