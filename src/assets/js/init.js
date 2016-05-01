/* global $ */
$(document).ready(function() {
  // disabled, TODO: confirm this functionality still needed
  /*$('.recommended').each(function(item){
   // $(this).find('div:first').find('div:first').find('div:first')
   $(this).find('.itinerary-airline')
   .append($('<span class="glyphicon glyphicon-thumbs-up" style="color:forestgreen"></span>'));
   });*/


  var getIconForAirline = function (el) {
    var _image = new Image(),
      _code = el.data('code'),
      _file = '/images/airlines/' + _code + '.png';
    _image.onload = function () {
      el.attr('src', _file);
    };
    _image.src = _file;
  };

  $('.airlineIcon').each(function () {
    getIconForAirline($(this));
  });

  $('#nav_slide_menu').offcanvas({
    toggle: false,
    placement: 'left'
  });

});

let nodes = [];

const ReactContentRenderer = {
  unmountAll() {
    if (nodes.length === 0) {
      return;
    }
    nodes.forEach(node => React.unmountComponentAtNode(node));
    nodes = [];
  },
  render(element, container, callback) {
    if (container instanceof jQuery) {
      container = container.get(0);
    }
    ReactDOM.render(element, container, callback);
    nodes.push(container);
  }
};

$(function () {
  $('#content')
    .on('content-will-change', ReactContentRenderer.unmountAll);
});
