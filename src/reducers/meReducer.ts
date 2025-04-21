import { produce } from 'immer';

import { INIT, UPDATE_ME, RESET_STATE } from '@/types/actionTypes';
import { isObject, isString, isNumber, mergeTxs } from '@/utils';

const initialState = {
  stxAddr: null, // null: n/a, '': no value, str: has value
  stxPubKey: null, // same as above
  stxSigStr: null, // same as above
  fthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  username: null, // null: n/a, ['': no value, str: has value](fetched at least once)
  avatar: null, // same as above
  bio: null, // same as above
  didAgreeTerms: null, // null or false: n/a or did not agree, true: agreed
  balance: null,
  shares: {},
  txs: {},
  enrlFthSts: null,
};

const meReducer = (state = initialState, action) => produce(state, draft => {
  if ([INIT, UPDATE_ME].includes(action.type)) {
    const { stxAddr, stxPubKey, stxSigStr } = action.payload;
    if (stxAddr === null || isString(stxAddr)) draft.stxAddr = stxAddr;
    if (stxPubKey === null || isString(stxPubKey)) draft.stxPubKey = stxPubKey;
    if (stxSigStr === null || isString(stxSigStr)) draft.stxSigStr = stxSigStr;

    const {
      fthSts, username, avatar, bio, didAgreeTerms, balance, shares,
    } = action.payload;
    if ([null, 0, 1, 2].includes(fthSts)) draft.fthSts = fthSts;
    if (username === null || isString(username)) draft.username = username;
    if (avatar === null || isString(avatar)) draft.avatar = avatar;
    if (bio === null || isString(bio)) draft.bio = bio;
    if ([null, true, false].includes(didAgreeTerms)) {
      draft.didAgreeTerms = didAgreeTerms;
    }
    if (balance === null || isNumber(balance)) draft.balance = balance;
    if (Array.isArray(shares)) {
      for (const share of shares) {
        draft.shares[share.id] = structuredClone(share);
      }
    } else if (isObject(shares)) {
      for (const share of Object.values<any>(shares)) {
        draft.shares[share.id] = structuredClone(share);
      }
    }

    const { tx, txs, removeTxIds } = action.payload;
    if (isObject(tx)) {
      draft.txs[tx.id] = mergeTxs(draft.txs[tx.id], tx);
    }
    if (Array.isArray(txs)) {
      for (const tx of txs) {
        draft.txs[tx.id] = mergeTxs(draft.txs[tx.id], tx);
      }
    } else if (isObject(txs)) {
      for (const tx of Object.values<any>(txs)) {
        draft.txs[tx.id] = mergeTxs(draft.txs[tx.id], tx);
      }
    }
    if (Array.isArray(removeTxIds)) {
      for (const id of removeTxIds) delete draft.txs[id];
    }

    const { enrlFthSts } = action.payload;
    if ([null, 0, 1, 2].includes(enrlFthSts)) draft.enrlFthSts = enrlFthSts;
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
