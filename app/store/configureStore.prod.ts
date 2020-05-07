import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';
import { Store, counterStateType } from '../reducers/types';
import { saveState } from '../utils/store';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: counterStateType): Store {
  const store = createStore(rootReducer, initialState, enhancer);
  store.subscribe(() => {
    saveState(store.getState());
  });
  return store;
}

export default { configureStore, history };
