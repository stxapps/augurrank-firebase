import {
  useStore as _useStore, useSelector as _useSelector, useDispatch as _useDispatch,
} from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';

import { UPDATE_ME } from '@/types/actionTypes';
import reducers from '@/reducers';
import { isObject } from '@/utils';

const persistMiddleWare = ({ dispatch, getState }) => next => action => {
  const res = next(action);

  if (isObject(action) && action.type === UPDATE_ME) {
    // cannot have await
    //const me = getState().me;

  }

  return res;
};

export const makeStore = () => {
  return createStore(
    reducers, composeWithDevTools(applyMiddleware(thunk, persistMiddleWare)),
  );
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useStore = _useStore.withTypes<AppStore>();
export const useSelector = _useSelector.withTypes<RootState>();
export const useDispatch = _useDispatch.withTypes<AppDispatch>();
