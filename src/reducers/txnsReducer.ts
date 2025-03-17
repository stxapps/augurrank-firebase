import { produce } from 'immer';

import {
  UPDATE_ME, UPDATE_PROFILE, UPDATE_TXNS, RESET_STATE,
} from '@/types/actionTypes';
import { isObject, mergeTxns } from '@/utils';

const initialState = {
  data: {},
};

const txnsReducer = (state = initialState, action) => produce(state, draft => {

  if (action.type === UPDATE_ME) {
    const { txn, txns } = action.payload;
    if (isObject(txn)) {
      draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
    }
    if (Array.isArray(txns)) {
      for (const txn of txns) {
        draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
      }
    } else if (isObject(txns)) {
      for (const txn of Object.values<any>(txns)) {
        draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
      }
    }
  }

  if (action.type === UPDATE_PROFILE) {
    // only if profile stxAddr === me's stxAddr
  }

  if (action.type === UPDATE_TXNS) {
    const { txn, txns, removeIds } = action.payload;
    if (isObject(txn)) {
      draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
    }
    if (Array.isArray(txns)) {
      for (const txn of txns) {
        draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
      }
    } else if (isObject(txns)) {
      for (const txn of Object.values<any>(txns)) {
        draft.data[txn.id] = mergeTxns(draft.data[txn.id], txn);
      }
    }
    if (Array.isArray(removeIds)) {
      for (const id of removeIds) delete draft.data[id];
    }
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default txnsReducer;
