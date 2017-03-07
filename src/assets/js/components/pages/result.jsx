import React from 'react';
import * as ReactRedux from 'react-redux';
import { ActionsStore, logAction } from '../../functions.js';
import SearchBanner from '../searchform/SearchBanner.jsx';
import ResultList from '../search/ResultList.jsx';
import DisplayAlert from '../_common/DisplayAlert.jsx';
import Buckets from '../search/buckets/Buckets.jsx';
import { actionSetCommonVal } from '../../actions.js';
import ClientApi from '../_common/api.js';
import { clientStore } from '../../reducers.js';
import moment from 'moment';

import { maxBucketVisibleFilters, bucketFilterItemHeigh, scrollAirlines } from '../../legacyJquery.js';
require('swiper');
require('jquery-slimscroll');

let firstSelectionCount = {};
let globalSelectionCount = 0;
let swiper;

let ResultPage = React.createClass({

  getInitialState: function() {
    return {
      isLoading: true,
      searchResultLength: 0,
      searchResultIds: [],
      filter: [],
    };
  },

  componentDidMount: function () {

    var updateState = (json) => {
      if (this.isMounted()) {
        this.setState({
          isLoading: false,
          tiles: json.tiles,
          searchResultLength: json.searchResult.length,
          searchResult: json.searchResult,
          searchResultIds: getIdsArrayFromAnything(json.searchResult),
          errorInfo: json.errorInfo,
          max_filter_items: json.max_filter_items
        }, function () {

          //FIXME refactor code to use non jquery based functionality
          $("#searchBanner").modal('hide');

          // correctly initialize the swiper
          swiper = new Swiper('.swiper-container', {
            freeMode: true,
            slidesPerView: 'auto'
          });

          // Init slim scroll
          var max_filter_items = parseInt($('#tiles').data('max_filter_items'));
          if (max_filter_items > maxBucketVisibleFilters || !max_filter_items) {
            max_filter_items = maxBucketVisibleFilters;
          }
          $('.list-group').slimScroll({
            height: parseInt(max_filter_items * bucketFilterItemHeigh)+2 +'px',
            touchScrollStep: 30
          });

        });
      }
    };

    if (this.state.isLoading) {
      var savedResult = JSON.parse(sessionStorage.getItem('savedResult') || '{}');

      var now = moment.utc();
      var duration = moment.duration(now.diff(moment(savedResult.time)));

      let searchParams = this.props.commonData.searchParams;
      let currentSort = {"name": "price", "order": "asc"};
      if (searchParams.topSearchOnly == 1) {
        currentSort = {"name": "smart", "order": "asc"};
      }

      Promise.resolve(this.props.actionSetCommonVal('currentSort', currentSort))
        .then(function () {
          if (
            duration.asMinutes() < 20
            && btoa(JSON.stringify(searchParams)) == sessionStorage.getItem('searchId')
            && savedResult.searchResult
            && savedResult.searchResult.length
          ) { //use cached result if params didn't change in 20 minutes
            console.log('sessionStorage used for next', Math.round(20 - duration.asMinutes()), 'minutes');
            updateState(savedResult);
          } else {
            $("#searchBanner").modal({
              backdrop: 'static',
              keyboard: false
            });
            console.log('server request used');

            ClientApi.reqPost('/result?s=' + btoa(JSON.stringify(searchParams)), searchParams, true)
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
                  clientStore.dispatch(actionSetCommonVal('iconSpriteMap', json.iconSpriteMap));
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
                console.error(error);
              });
          }
        });
      }
  },

  componentWillMount: function () {
    analytics.page(this.props.location.pathname);
    ActionsStore.changeForm('result', false);

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

    ActionsStore.getSearchResultItineraryIds = () => {
      if (this.state.searchResult && this.state.searchResult.length > 0) {
        return getIdsArrayFromAnything(this.state.searchResult);
      } else {
        return [];
      }
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

    this.setState({searchResult: itineraries, searchResultIds: getIdsArrayFromAnything(itineraries)});
    this.props.actionSetCommonVal('currentSort', {"name": option, "order": direction});
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
    this.setState({tiles: tiles}, function () {
      scrollAirlines();
    });
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
    this.setState({searchResult: itineraries, searchResultIds: getIdsArrayFromAnything(itineraries)});

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
      <div className={ 'search-result ' + this.props.commonData.searchParams.flightType }>
        {this.state.isLoading === true ? null :
          (this.state.searchResultLength
            ? (<span>
                 <Buckets
                   tiles={this.state.tiles}
                   filter={this.state.filter}
                   searchResultLength={this.state.searchResultLength}
                   currentSort={this.props.commonData.currentSort}
                   max_filter_items={this.state.max_filter_items}
                 />
                 <ResultList InitResultData={this.state} searchParams={this.props.commonData.searchParams} />
               </span>)
            : <DisplayAlert errorInfo={this.state.errorInfo} />
        )}
        <SearchBanner />
      </div>
    )
  }
});

function getIdsArrayFromAnything(anything = []) {
  if (anything.length) {
    return anything.map(({id}) => id);
  } else {
    return [];
  }
}

const mapStateCommon = function(store) {
  return {
    commonData: store.commonData,
  };
};

const mapDispatchCommon = (dispatch) => {
  return {
    actionSetCommonVal: (fieldName, fieldValue) => {
      return dispatch(actionSetCommonVal(fieldName, fieldValue));
    }
  }
};

const ResultPageContainer = ReactRedux.connect(mapStateCommon, mapDispatchCommon)(ResultPage);

export default ResultPageContainer;
