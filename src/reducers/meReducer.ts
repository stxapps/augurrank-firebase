import { produce } from 'immer';

import { INIT, UPDATE_ME, RESET_STATE } from '@/types/actionTypes';
import {
  isObject, isString, isNumber, isFldStr, mergeTxs, isTxConfirmed,
} from '@/utils';

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
  txFthSts: null,
  txs: {},
  pdgTxs: {}, // a duplicate (of txs) pending txs e.g., for storing local
  txQuryCrsr: null,
  txFthMoreSts: null,
  enrlFthSts: null,
};

const meReducer = (state = initialState, action) => produce(state, draft => {
  if ([INIT, UPDATE_ME].includes(action.type)) {
    const { stxAddr, stxPubKey, stxSigStr } = action.payload;
    if (stxAddr === null || isString(stxAddr)) draft.stxAddr = stxAddr;
    if (stxPubKey === null || isString(stxPubKey)) draft.stxPubKey = stxPubKey;
    if (stxSigStr === null || isString(stxSigStr)) draft.stxSigStr = stxSigStr;

    const {
      fthSts, username, avatar, bio, didAgreeTerms, balance,
    } = action.payload;
    if ([null, 0, 1, 2].includes(fthSts)) draft.fthSts = fthSts;
    if (username === null || isString(username)) draft.username = username;
    if (avatar === null || isString(avatar)) draft.avatar = avatar;
    if (bio === null || isString(bio)) draft.bio = bio;
    if ([null, true, false].includes(didAgreeTerms)) {
      draft.didAgreeTerms = didAgreeTerms;
    }
    if (balance === null || isNumber(balance)) draft.balance = balance;

    const { share, shares } = action.payload;
    if (isObject(share)) {
      draft.shares[share.id] = structuredClone(share);
    }
    if (Array.isArray(shares)) {
      for (const share of shares) {
        draft.shares[share.id] = structuredClone(share);
      }
    } else if (isObject(shares)) {
      for (const share of Object.values<any>(shares)) {
        draft.shares[share.id] = structuredClone(share);
      }
    }

    const { txFthSts, tx, txs, removeTxIds } = action.payload;
    if ([null, 0, 1, 2].includes(txFthSts)) draft.txFthSts = txFthSts;
    if (isObject(tx)) {
      txToDrft(draft, tx);
    }
    if (Array.isArray(txs)) {
      for (const tx of txs) {
        txToDrft(draft, tx);
      }
    } else if (isObject(txs)) {
      for (const tx of Object.values<any>(txs)) {
        txToDrft(draft, tx);
      }
    }
    if (Array.isArray(removeTxIds)) {
      for (const id of removeTxIds) {
        delete draft.txs[id];
        delete draft.pdgTxs[id];
      }
    }

    const { txQuryCrsr, txFthMoreSts } = action.payload;
    if (txQuryCrsr === null || isFldStr(txQuryCrsr)) draft.txQuryCrsr = txQuryCrsr;
    if ([null, 0, 2].includes(txFthMoreSts)) draft.txFthMoreSts = txFthMoreSts;

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

const txToDrft = (draft, tx) => {
  draft.txs[tx.id] = mergeTxs(draft.txs[tx.id], tx);

  if (isTxConfirmed(tx)) {
    delete draft.pdgTxs[tx.id];
  } else {
    draft.pdgTxs[tx.id] = structuredClone(draft.txs[tx.id]);
  }
};

export default meReducer;
