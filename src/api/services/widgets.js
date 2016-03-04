/**
 * Widgets for HTML forms elements
 *
 */
module.exports = {

  /**
   * Select element
   *
   * @param {object} srcObj Model or processed structure
   * @param {string} attName
   * @param {object} srcData For element rendering as key:value pairs
   * @param {object} htmlOptions
   * @returns {string} as key:value pairs, optional
   */
  dropDownList: function(srcObj, attName, srcData, htmlOptions) {
    var _html_att = "";
    var _res;

    // parse Html options
    if(typeof htmlOptions == "object") {
      for (var att in htmlOptions) {
        if (htmlOptions.hasOwnProperty(att))
          _html_att += (" " + att + '="' + htmlOptions[att] + '"');
      }
    }

    _res = '<select name="'+attName+'"'+_html_att+'><option value="">---</option>\n';

    // Make <option> data
    for(var att in srcData) {
      if (srcData.hasOwnProperty(att))
      {
        var _selected = (typeof srcObj[attName] != 'undefined' && srcObj[attName] == att) ? ' selected="selected"' : "";
        _res += ('<option value="'+att+'"'+_selected+'>'+srcData[att]+'</option>\n');
      }
    }

    _res += '</select>\n';
    return _res;
  }
};
