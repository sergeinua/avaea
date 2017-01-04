import React from 'react';
import { ActionsStore, createMarkup } from '../../../../functions.js';

let Tile = React.createClass({
  getInitialState: function() {
    return {
      tile: this.props.info
    };
  },

  showClass: function (filter) {
    var classes = ["list-group-item"];
    if (filter.selected && !filter.count) {
      classes.push("dis-selected");
      classes.push("disabled");
    } else if (filter.selected) {
      classes.push("selected");
    } else if (!filter.count) {
      classes.push("disabled");
    }
    return classes.join(" ");
  },

  updateTiles: function (filter) {
    return function() {

      if (filter.id == 'airline_tile') {
        $('#' + filter.id).data("_is_touched", 1);
      }

      if (filter.count) {
        ActionsStore.updateTiles(filter);
      }
    }.bind(this);
  },

  render: function() {
    var updateTiles = this.updateTiles;
    var showClass = this.showClass;
    return (
          <div className="swiper-slide">
            <div className="mybucket" id={this.state.tile.id}>
              <div className="mycustomtab">{this.state.tile.name}</div>
              <ul className="list-group">
                { this.state.tile.filters.map( function (filter) {
                return <li key={filter.id}
                           className={showClass(filter)}
                           onClick={updateTiles(filter)}
                       ><div className="text" dangerouslySetInnerHTML={createMarkup(filter.title)}/>
                           {filter.count?<span className="badge">{filter.count}</span>:null}
                       </li>
              })}
              </ul>
            </div>
          </div>
    )
  }
});

export default Tile;
