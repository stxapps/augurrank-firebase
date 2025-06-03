import { produce } from 'immer';

import { UPDATE_PROFILE } from '@/types/actionTypes';
import { isObject, isString, isNumber, isFldStr, mergeTxs } from '@/utils';

// key: stxAddr
// value: fthSts, username, avatar, bio, balance, shares,
//          txFthSts, txs, txQuryCrsr, txFthMoreSts
const initialState = {};

const profilesReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_PROFILE) {
    const { stxAddr } = action.payload;

    if (isFldStr(stxAddr)) {
      init(draft, stxAddr);

      const { fthSts, username, avatar, bio, balance } = action.payload;
      if ([null, 0, 1, 2].includes(fthSts)) draft[stxAddr].fthSts = fthSts;
      if (username === null || isString(username)) draft[stxAddr].username = username;
      if (avatar === null || isString(avatar)) draft[stxAddr].avatar = avatar;
      if (bio === null || isString(bio)) draft[stxAddr].bio = bio;
      if (balance === null || isNumber(balance)) draft[stxAddr].balance = balance;

      const { share, shares } = action.payload;
      if (isObject(share)) {
        draft[stxAddr].shares[share.id] = structuredClone(share);
      }
      if (Array.isArray(shares)) {
        for (const share of shares) {
          draft[stxAddr].shares[share.id] = structuredClone(share);
        }
      } else if (isObject(shares)) {
        for (const share of Object.values<any>(shares)) {
          draft[stxAddr].shares[share.id] = structuredClone(share);
        }
      }

      const { txFthSts, tx, txs } = action.payload;
      if ([null, 0, 1, 2].includes(txFthSts)) draft[stxAddr].txFthSts = txFthSts;
      if (isObject(tx)) {
        draft[stxAddr].txs[tx.id] = mergeTxs(draft[stxAddr].txs[tx.id], tx);
      }
      if (Array.isArray(txs)) {
        for (const tx of txs) {
          draft[stxAddr].txs[tx.id] = mergeTxs(draft[stxAddr].txs[tx.id], tx);
        }
      } else if (isObject(txs)) {
        for (const tx of Object.values<any>(txs)) {
          draft[stxAddr].txs[tx.id] = mergeTxs(draft[stxAddr].txs[tx.id], tx);
        }
      }

      const { txQuryCrsr, txFthMoreSts } = action.payload;
      if (txQuryCrsr === null || isFldStr(txQuryCrsr)) {
        draft[stxAddr].txQuryCrsr = txQuryCrsr;
      }
      if ([null, 0, 2].includes(txFthMoreSts)) {
        draft[stxAddr].txFthMoreSts = txFthMoreSts;
      }
    }
  }
});

const init = (draft, stxAddr) => {
  if (!isObject(draft[stxAddr])) {
    draft[stxAddr] = {
      fthSts: null,
      username: null,
      avatar: null,
      bio: null,
      balance: null,
      shares: {},
      txFthSts: null,
      txs: {},
      txQuryCrsr: null,
      txFthMoreSts: null,
    };
  }
};

export default profilesReducer;
