import {
  useStore as _useStore, useSelector as _useSelector, useDispatch as _useDispatch,
} from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';

import idxApi from '@/apis';
import { UPDATE_ME, RESET_STATE } from '@/types/actionTypes';
import reducers from '@/reducers';
import { isObject } from '@/utils';

const persistMiddleWare = ({ dispatch, getState }) => next => action => {
  const res = next(action);

  if (isObject(action) && [UPDATE_ME, RESET_STATE].includes(action.type)) {
    const me = getState().me;
    idxApi.putLocalMe(me);
  }

  return res;
};

export const makeStore = () => {
  return createStore(
    reducers, composeWithDevTools(applyMiddleware(thunk, persistMiddleWare)),
  );
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];
export type RootState = ReturnType<AppGetState>;

export const useStore = _useStore.withTypes<AppStore>();
export const useSelector = _useSelector.withTypes<RootState>();
export const useDispatch = _useDispatch.withTypes<AppDispatch>();
