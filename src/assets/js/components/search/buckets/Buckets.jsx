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
        ActionsStore.undoTiles();
      }
    }.bind(this);
  },

  handleClear: function () {
    return function() {
      if (this.props.searchResultLength != this.state.searchResultLength) {
        ActionsStore.clearTiles();
      }
    }.bind(this);
  },

  toggleFullInfo: function () {
    ActionsStore.toggleFullInfo = (value) => {
      var newVal = (typeof value != 'undefined')?value:!this.state.fullinfo;
      this.setState({fullinfo: newVal});
    };
    return function() {
      ActionsStore.toggleFullInfo();
    }.bind(this);
  },

  render: function() {
    return (
    <div className={this.state.fullinfo ?"filters-area open":"filters-area closed"}>
      <div className="holder">
         <div className={this.state.fullinfo ? "swiper-container":"swiper-container hide"}>
           <div id="tiles" className="swiper-wrapper" data-max_filter_items={ this.props.max_filter_items }>
             {this.state.tiles.map(function (tile) {
               return <Tile key={tile.id} info={tile} />
             })}
           </div>
        </div>

        <div className={this.state.fullinfo ? "bottomNav":"bottomNav sticks"}>
          <div className="bottom-nav-text">
          <span>Showing <span className='search_count' id='search_count'>{ this.props.searchResultLength }/{this.state.searchResultLength} </span>
          flights by</span> </div><Sorter current={this.props.currentSort}/>
          <div className="clear-undo-buttons text-right">
            <span id="clear" className="clear-all-filters" onClick={this.handleClear()}>Clear</span>|
            <span id="undo" className="undo-button" onClick={this.handleUndo()}>Undo</span>
            <span id="filters-expander" className={this.state.fullinfo ?"icon-expander-up":"icon-expander-down"} onClick={this.toggleFullInfo()}></span>
          </div>
        </div>
      </div>
    </div>

    )
  }
});