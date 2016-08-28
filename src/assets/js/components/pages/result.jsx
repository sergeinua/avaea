var ResultPage = React.createClass({
  getInitialState: function() {
    return {
      title: this.props.InitResultData.title,
      tiles: this.props.InitResultData.tiles,
      searchParams: this.props.InitResultData.searchParams,
      searchResultLength: this.props.InitResultData.searchResultLength,
      searchResult: this.props.InitResultData.searchResult,
      iconSpriteMap: this.props.InitResultData.iconSpriteMap,
      filter: []
    };
  },

  componentWillMount: function () {
    SearchForm.updateTiles = (filter) => {
      this.updateTiles(filter);
    }
  },

  updateTiles: function (filterNew) {
    var itineraries = this.state.searchResult;

    var filters = this.state.filter;
    if (filterNew.selected) {
      var found = filters.indexOf(filterNew.id);
      if (found != -1) {
        filters.splice(found, 1);
      }
    } else {
      filters.push(filterNew.id);
    }
    this.setState({filter: filters});

    this.resetResultVisibility();
    this.filterItineraries();

    var groups = {};

    if (filters.length) {
      filters.forEach(function (filter) {
        if (filter && filter != '') {
          var tileGroup = filter.replace(/(tile).+/, '$1');
          if (typeof groups[tileGroup] == 'undefined') {
            groups[tileGroup] = [];
          }
          groups[tileGroup].push(filter);
        }
      });
    }

    var filterProps = filters;
    var tiles = this.state.tiles;
    tiles.map(function(tile) {
      return tile.filters.map(function (filter) {
        filter.selected = (filterProps.indexOf(filter.id) !== -1);

        var count = 0;
        if (filter.selected) {
          itineraries.map(function (item) {
            if (!item.is_hidden && item.filterArr.indexOf(filter.id) !== -1) {
              count++;
            }
          });
        } else {
          var tileGroup = filter.id.replace(/(tile).+/, '$1');
          var predictedResult = itineraries.filter(function(item) {
            return (item.filterArr.indexOf(filter.id) !== -1);
          });
          for (var key in groups) {
            if (!groups.hasOwnProperty(key)) continue;

            if (key != tileGroup) {
              predictedResult = predictedResult.filter(function (item) {
                var filtersIntersect = groups[key].filter(function(n) {
                  return item.filterArr.indexOf(n) != -1;
                });

                return (!!filtersIntersect.length);
              });
            }
          }
          count = predictedResult.length;

        }
        filter.count = count;
      });
    });
    this.setState({tiles: tiles});
  },

  resetResultVisibility: function() {
    var itineraries = this.state.searchResult;
    itineraries.map(function(item) {
      item.is_hidden = false;
      return item;
    });
  },

  filterItineraries: function() {
    var buckets = this.state.tiles;
    var filters = this.state.filter;
    var itineraries = this.state.searchResult;

    // hide filtered itineraries
    buckets.map(function(bucket) {
      var selected = [];
      bucket.filters.map(function(filter) {
        if (filters.indexOf(filter.id) !== -1) {
          selected.push(filter.id);
        }
      });
      if (selected.length) {
        itineraries.map(function (item) {
          var filtersIntersect = selected.filter(function(n) {
            return item.filterArr.indexOf(n) != -1;
          });
          if (!item.is_hidden && !filtersIntersect.length) {
            item.is_hidden = true;
          }
        });
      }
    });
    this.setState({searchResult: itineraries});

    // recalculate visible itineraries
    var count = 0;
    itineraries.map(function(item) {
      if (!item.is_hidden) {
        count++;
      }
    });
    this.setState({searchResultLength: count});
  },

  render: function() {
    return (
      <div>
        <NavBar InitResultData={this.state}/>
        {(this.props.InitResultData.searchResultLength
            ? (<span>
                 <Buckets tiles={this.state.tiles} filter={this.state.filter} searchResultLength={this.state.searchResultLength}/>
                 <ResultList InitResultData={this.state} />
               </span>)
            : <NotFound departure={this.props.InitResultData.departure} arrival={this.props.InitResultData.arrival} />
        )}

      </div>
    )
  }
});

function renderResultPage(InitResultData) {
  if ($('#resultpage').length) {
    ReactContentRenderer.render(<ResultPage InitResultData = {InitResultData}/>, $('#resultpage'));
  }
}

$(document).ready(function() {
  if (typeof InitResultData != 'undefined') {
    renderResultPage(InitResultData);
  }
});
