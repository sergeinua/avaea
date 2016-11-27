var firstSelectionCount = {};
var globalSelectionCount = 0;

var ResultPage = React.createClass({
  getInitialState: function() {
    var searchParams;
    var currentSort = {"name": "price", "order": "asc"};

    if (localStorage.getItem('searchParams')) {
      //use data from local storage if exists
      searchParams = JSON.parse(localStorage.getItem('searchParams'));
    } else {
      //use data from server with default/session params if local storage is empty
      searchParams = this.props.InitSearchFormData.searchParams;
    }

    if (searchParams.topSearchOnly == 1) {
      currentSort = {"name": "smart", "order": "asc"};
    }
    return {
      isLoading: true,
      searchParams: searchParams,
      searchResultLength: 0,
      filter: [],
      currentSort: currentSort
    };
  },

  componentDidMount: function () {
    var searchParams = this.state.searchParams;
    ActionsStore.updateNavBarSearchParams(searchParams);
    var updateState = (json) => {
      this.setState({
        isLoading: false,
        tiles: json.tiles,
        searchResultLength: json.searchResult.length,
        searchResult: json.searchResult,
        errorInfo: json.errorInfo
      }, function () {

        //FIXME refactor code to use non jquery based swiper functionality
        $("#searchBanner").modal('hide');

        // correctly initialize the swiper for desktop vs. touch

        if (!uaMobile) {
          // is desktop
          swiper = new Swiper('.swiper-container', {
            freeMode: true,
            slidesPerView: '5.5'
          });

        } else {
          // is touch
          swiper = new Swiper('.swiper-container', {
            freeMode: true,
            slidesPerView: 'auto'
          });
        }

      });
    };
    if (this.state.isLoading) {
      var savedResult = JSON.parse(sessionStorage.getItem('savedResult') || '{}');

      var now = moment.utc();
      var duration = moment.duration(now.diff(moment(savedResult.time)));

      if (
        duration.asMinutes() < 20
        && btoa(JSON.stringify(searchParams)) == sessionStorage.getItem('searchId')
        && savedResult.searchResult
        && savedResult.searchResult.length
      ) { //use cached result if params didn't change in 20 minutes
        console.log('sessionStorage used for next', Math.round(20 - duration.asMinutes()), 'minutes');
        updateState(savedResult);
      } else {
        $("#searchBanner").modal();
        console.log('server request used');

        fetch('/result?s=' + btoa(JSON.stringify(searchParams)), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchParams),
          credentials: 'same-origin' // required for including auth headers
        })
          .then((response) => response.json())
          .then((json) => {
            if (json.errorInfo) {
              console.log(json.errorInfo);
              updateState({
                isLoading: false,
                tiles: [],
                searchResult: [],
                errorInfo: json.errorInfo
              });
            } else {
              sessionStorage.setItem('iconSpriteMap', JSON.stringify(json.iconSpriteMap));
              json.time = moment();
              sessionStorage.setItem('savedResult', JSON.stringify(json));
              sessionStorage.setItem('searchId', btoa(JSON.stringify(searchParams)));
              updateState(json);
            }
          })
          .catch((error) => {
            updateState({
              isLoading: false,
              tiles: [],
              searchResult: [],
              errorInfo: {
                type:'Error.Search.NoConnection',
                messages: [
                  "Your request cannot be processed",
                  "at the moment due to technical problems.",
                  "Please try again later"
                ]
              }
            });
            console.log(error);
          });
      }
    }
  },

  componentWillMount: function () {
    ActionsStore.updateNavBarPage('result');

    ActionsStore.updateTiles = (filter) => {

      var tileId = filter.id.replace(/(tile).+/, '$1');
      var filters = this.state.filter;
      var groups = {};
      var needRecalculate = false;

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

      if (filter.selected) {
        if (groups[tileId]) {
          needRecalculate = !((groups[tileId].length || 1) - 1);
        } else {
          needRecalculate = true;
        }
        // log to abo
        logAction('on_tile_choice', {
          action: 'filter_remove',
          tileName: tileId,
          tileValue: filter.title,
          tileId: filter.id,
          sample: (-1.0 * firstSelectionCount[tileId]) / this.state.tiles.length,
          recalculate: needRecalculate
        });

      } else {

        // Check if the very first bucket in a tile is selected
        if (groups[tileId]) {
          needRecalculate = !(groups[tileId].length || 0);
        } else {
          needRecalculate = true;
        }
        globalSelectionCount++;
        if (needRecalculate) {
          firstSelectionCount[tileId] = globalSelectionCount;
        }
        // log to abo
        logAction('on_tile_choice', {
          action: 'filter_add',
          tileName: tileId,
          tileValue: filter.title,
          tileId: filter.id,
          sample: (1.0 * firstSelectionCount[tileId]) / this.state.tiles.length,
          recalculate: needRecalculate
        });

      }

      this.updateTiles(filter);
    };
    ActionsStore.undoTiles = () => {
      this.undoTiles();
    };
    ActionsStore.clearTiles = () => {
      this.clearTiles();
    };
    ActionsStore.sortItineraries = (option, direction) => {
      this.sortItineraries(option, direction);
    };
  },

  sortItineraries: function (option, direction) {
    var itineraries = this.state.searchResult;
    itineraries.sort(function (a, b) {
      switch (option) {
        case 'smart':
          a = parseFloat(a.smartRank);
          b = parseFloat(b.smartRank);
          break;
        case 'price':
          a = parseFloat(a.price);
          b = parseFloat(b.price);
          break;
        case 'duration':
          a = parseFloat(a.durationMinutes);
          b = parseFloat(b.durationMinutes);
          break;
        case 'odepart':
          a = parseFloat(a.citypairs[0].from.minutes);
          b = parseFloat(b.citypairs[0].from.minutes);
          break;
        case 'oarrival':
          a = parseFloat(a.citypairs[0].to.minutes);
          b = parseFloat(b.citypairs[0].to.minutes);
          break;
        case 'idepart':
          a = parseFloat(a.citypairs[a.citypairs.length - 1].from.minutes);
          b = parseFloat(b.citypairs[b.citypairs.length - 1].from.minutes);
          break;
        case 'iarrival':
          a = parseFloat(a.citypairs[a.citypairs.length - 1].to.minutes);
          b = parseFloat(b.citypairs[b.citypairs.length - 1].to.minutes);
          break;
        default:
          a = parseFloat(a.price);
          b = parseFloat(b.price);
      }

      if (direction == 'desc') {
        b = [a, a = b][0];
      }
      return (a > b) ? 1 : ((a < b) ? -1 : 0);
    });

    this.setState({searchResult: itineraries});
    this.setState({currentSort: {"name": option, "order": direction}});
  },

  clearTiles: function () {
    this.setState({filter: []}, function() {
      this.updateTiles('');
      swiper.slideTo(0);
    });
  },

  undoTiles: function () {
    var filters = this.state.filter;
    var lastFilter = filters[filters.length - 1];
    if (lastFilter) {
      swiper.slideTo($('#' + lastFilter.replace(/(tile).+/, '$1') ).parents('.swiper-slide').index());
    }
    filters = filters.splice(0, filters.length-1);
    this.setState({filter: filters}, function() {
      this.updateTiles('');
    });
  },

  updateTiles: function (filterNew) {
    var itineraries = this.state.searchResult;

    var filters = this.state.filter;
    if (filterNew) {
      if (filterNew.selected) {
        var found = filters.indexOf(filterNew.id);
        if (found != -1) {
          filters.splice(found, 1);
        }
      } else {
        filters.push(filterNew.id);
      }
      swiper.slideTo($('#' + filterNew.id.replace(/(tile).+/, '$1') ).parents('.swiper-slide').index());
      this.setState({filter: filters});
    }
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
    scrollAirlines();
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
      <div className="search-result">
        {this.state.isLoading === true ? null :
          (this.state.searchResultLength
            ? (<span>
                 <Buckets tiles={this.state.tiles} filter={this.state.filter} searchResultLength={this.state.searchResultLength} currentSort={this.state.currentSort}/>
                 <ResultList InitResultData={this.state} />
               </span>)
            : <DisplayAlert errorInfo={this.state.errorInfo} />
        )}
        <SearchBanner />
      </div>
    )
  }
});
