import { clientStore } from 'reducers.js';
import { actionSetCommonVal } from 'actions.js';

//global object for communication with react components
export let ActionsStore = {
  getIconSpriteMap: function () {
    var iconSpriteMap = sessionStorage.getItem('iconSpriteMap');
    return JSON.parse(iconSpriteMap || '[]');
  },

  updateNavBarPage: (page) => {
    if (page) {
      clientStore.dispatch(actionSetCommonVal('page', page));
    }
  }
};

// DEMO-796 fix for iOS10
export function unfocusFormForIos() {
  let index;
  let inputs = document.getElementsByTagName('input');
  for (index = 0; index < inputs.length; ++index) {
    inputs[index].blur();
  }
  let selects = document.getElementsByTagName('select');
  for (index = 0; index < selects.length; ++index) {
    selects[index].blur();
  }
  let textareas = document.getElementsByTagName('textarea');
  for (index = 0; index < textareas.length; ++index) {
    textareas[index].blur();
  }
}
