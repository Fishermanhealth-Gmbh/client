import { Asset } from '../interfaces/asset';

export const ADD_ASSET = 'ADD_ASSET';
export const UPDATE_ASSET = 'UPDATE_ASSET';
export const REMOVE_ASSET = 'REMOVE_ASSET';

export const addAsset = (asset: Asset) => ({ type: ADD_ASSET, asset });
export const updateAsset = (asset: Asset) => ({ type: UPDATE_ASSET, asset });
export const removeAsset = (asset: Asset) => ({ type: REMOVE_ASSET, asset });
