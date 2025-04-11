import { produce } from 'immer';

import { INIT, UPDATE_ME, RESET_STATE } from '@/types/actionTypes';
import { isObject, isString } from '@/utils';

const initialState = {
  stxAddr: null, // null: n/a, '': no value, str: has value
  stxPubKey: null, // same as above
  stxSigStr: null, // same as above
  fthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  username: null, // null: n/a, ['': no value, str: has value](fetched at least once)
  avatar: null, // same as above
  bio: null, // same as above
  didAgreeTerms: null, // null or false: n/a or did not agree, true: agreed
  txns: {},
};

const meReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === INIT) {
    draft.stxAddr = action.payload.stxAddr;
    draft.stxPubKey = action.payload.stxPubKey;
    draft.stxSigStr = action.payload.stxSigStr;
    draft.username = action.payload.username;
    draft.avatar = action.payload.avatar;
    draft.bio = action.payload.bio;
    draft.didAgreeTerms = action.payload.didAgreeTerms;
  }

  if (action.type === UPDATE_ME) {
    const {
      stxAddr, stxPubKey, stxSigStr, fthSts, username, avatar, bio, didAgreeTerms,
      txn, txns, removeTxnIds,
    } = action.payload;

    if (stxAddr === null || isString(stxAddr)) draft.stxAddr = stxAddr;
    if (stxPubKey === null || isString(stxPubKey)) draft.stxPubKey = stxPubKey;
    if (stxSigStr === null || isString(stxSigStr)) draft.stxSigStr = stxSigStr;

    if ([null, 0, 1, 2].includes(fthSts)) draft.fthSts = fthSts;

    if (username === null || isString(username)) draft.username = username;
    if (avatar === null || isString(avatar)) draft.avatar = avatar;
    if (bio === null || isString(bio)) draft.bio = bio;

    if ([null, true, false].includes(didAgreeTerms)) {
      draft.didAgreeTerms = didAgreeTerms;
    }

    if (isObject(txn)) {
      draft.txns[txn.id] = structuredClone(txn);
    }
    if (Array.isArray(txns)) {
      for (const txn of txns) {
        draft.txns[txn.id] = structuredClone(txn);
      }
    } else if (isObject(txns)) {
      for (const txn of Object.values<any>(txns)) {
        draft.txns[txn.id] = structuredClone(txn);
      }
    }

    if (Array.isArray(removeTxnIds)) {
      for (const id of removeTxnIds) delete draft.txns[id];
    }
  }

  if (action.type === RESET_STATE) {
    const newState = structuredClone(initialState);
    newState.stxAddr = action.payload.stxAddr;
    newState.stxPubKey = action.payload.stxPubKey;
    newState.stxSigStr = action.payload.stxSigStr;
    return newState;
  }
});

export default meReducer;
