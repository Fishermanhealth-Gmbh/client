import { Asset } from '../interfaces/asset';
import { Action } from 'redux';
import { ADD_ASSET, UPDATE_ASSET, REMOVE_ASSET } from '../actions/assets';
import { loadState } from '../utils/store';
import _ from 'lodash';
const _state = loadState('assets') || {
  items: []
};
export default (
  state: { items: Asset[] } = _state,
  action: Action & { asset: Asset }
) => {
  switch (action.type) {
    case ADD_ASSET:
      return {
        items: [...state.items, action.asset]
      };
    case UPDATE_ASSET:
      let items = state.items;
      // Find item index using _.findIndex (thanks @AJ Richardson for comment)
      const index = _.findIndex(items, {
        tmpFilename: action.asset.tmpFilename
      });

      // Replace item at index using native splice
      items.splice(index, 1, action.asset);
      return {
        items
      };
    case REMOVE_ASSET:
      _.remove(state.items, action.asset);
      return {
        items: state.items
      };
    default:
      return state;
  }
};
