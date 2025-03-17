import { produce } from 'immer';

import { UPDATE_PROFILE } from '../types/actionTypes';
import { isObject, isString, mergeTxns } from '@/utils';

const initialState = {
  stxAddr: null, // null: not yet, empty str: invalid, filled str: valid
  didFetch: null, // null: not yet, true: fetched, false: error
  data: null,
  prevFName: null,
  fetchingMore: null, // null: not fetching, true: fetching, false: error
};

const profileReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_PROFILE) {
    const {
      stxAddr, didFetch, data, dataMore, prevFName, fetchingMore,
    } = action.payload;

    if (stxAddr === null || isString(stxAddr)) {
      if (draft.stxAddr !== stxAddr) Object.assign(draft, initialState, { stxAddr });
    }

    if ([null, true, false].includes(didFetch)) draft.didFetch = didFetch;

    if (data === null) {
      draft.data = null;
    } else if (isObject(data)) {
      draft.data = structuredClone(data);
    }

    if (isObject(dataMore) && Array.isArray(dataMore.txns)) {
      if (isObject(draft.data) && isObject(draft.data.txns)) {
        for (const txn of dataMore.txns) {
          draft.data.txns[txn.id] = mergeTxns(draft.data.txns[txn.id], txn);
        }
      }
    }

    if (prevFName === null || isString(prevFName)) draft.prevFName = prevFName;
    if ([null, true, false].includes(fetchingMore)) draft.fetchingMore = fetchingMore;
  }
});

export default profileReducer;
