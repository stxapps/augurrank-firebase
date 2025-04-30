import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import {
  fstoreAdmin as db, evtToDoc, syncToDoc, userToDoc, shareToDoc, txToDoc,
} from '@/apis/server/fbaseAdmin';
import {
  LETTER_JOINS, USERS, SHARES, TXS, EVENTS, SYNCS, ACTIVE, INDEX, N_DOCS, SCS,
} from '@/types/const';
import {
  isObject, isFldStr, newObject, isAvatarEqual, mergeTxs, rectifyUser, rectifyShare,
  rectifyTx,
} from '@/utils';
import { docToEvt, docToSync, docToUser, docToShare, docToTx } from '@/utils/fbase';

const addLetterJoin = async (logKey, email) => {
  const ref = db.collection(LETTER_JOINS).doc(email);

  const snapshot = await ref.get();
  if (snapshot.exists) {
    console.log(`(${logKey}) Join letter with duplicate email:`, email);
    return;
  }

  await ref.create({
    status: ACTIVE,
    createDate: FieldValue.serverTimestamp(),
    updateDate: FieldValue.serverTimestamp(),
  });
  console.log(`(${logKey}) Saved to Firestore`);
};

const updateProfile = async (logKey, stxAddr, profile) => {
  const ref = db.collection(USERS).doc(stxAddr);

  await db.runTransaction(async (t) => {
    let oldUser = null, newUser = null;
    const attrs = [
      'username', 'avatar', 'bio', 'usnVrfDt', 'avtVrfDt', 'noInLdb', 'noPrflPg',
    ];
    const now = Date.now();

    const snapshot = await t.get(ref);
    if (snapshot.exists) {
      oldUser = docToUser(stxAddr, snapshot.data());
      newUser = { ...newObject(oldUser, attrs), updateDate: now };
    } else {
      oldUser = {};
      newUser = { stxAddr, createDate: now, updateDate: now };
    }

    let isDiff = false;
    if (isFldStr(oldUser.username) && isFldStr(profile.username)) {
      if (oldUser.username === profile.username) {
        [newUser.username, newUser.usnVrfDt] = [oldUser.username, oldUser.usnVrfDt];
      } else {
        [newUser.username, newUser.usnVrfDt, isDiff] = [profile.username, null, true];
      }
    } else if (isFldStr(profile.username)) {
      [newUser.username, newUser.usnVrfDt, isDiff] = [profile.username, null, true];
    } else if (isFldStr(oldUser.username) && !('username' in profile)) {
      [newUser.username, newUser.usnVrfDt] = [oldUser.username, oldUser.usnVrfDt];
    } else if (isFldStr(oldUser.username)) {
      isDiff = true;
    }

    if (isFldStr(oldUser.avatar) && isFldStr(profile.avatar)) {
      if (isAvatarEqual(oldUser.avatar, profile.avatar)) {
        [newUser.avatar, newUser.avtVrfDt] = [oldUser.avatar, oldUser.avtVrfDt];
      } else {
        [newUser.avatar, newUser.avtVrfDt, isDiff] = [profile.avatar, null, true];
      }
    } else if (isFldStr(profile.avatar)) {
      [newUser.avatar, newUser.avtVrfDt, isDiff] = [profile.avatar, null, true];
    } else if (isFldStr(oldUser.avatar) && !('avatar' in profile)) {
      [newUser.avatar, newUser.avtVrfDt] = [oldUser.avatar, oldUser.avtVrfDt];
    } else if (isFldStr(oldUser.avatar)) {
      isDiff = true;
    }

    if (isFldStr(oldUser.bio) && isFldStr(profile.bio)) {
      if (oldUser.bio === profile.bio) {
        newUser.bio = oldUser.bio;
      } else {
        [newUser.bio, isDiff] = [profile.bio, true];
      }
    } else if (isFldStr(profile.bio)) {
      [newUser.bio, isDiff] = [profile.bio, true];
    } else if (isFldStr(oldUser.bio) && !('bio' in profile)) {
      newUser.bio = oldUser.bio;
    } else if (isFldStr(oldUser.bio)) {
      isDiff = true;
    }

    if (oldUser.noInLdb === true && profile.noInLdb === true) {
      newUser.noInLdb = true;
    } else if (profile.noInLdb === true) {
      [newUser.noInLdb, isDiff] = [true, true];
    } else if (oldUser.noInLdb === true && !('noInLdb' in profile)) {
      newUser.noInLdb = true;
    } else if (oldUser.noInLdb === true) {
      isDiff = true;
    }

    if (oldUser.noPrflPg === true && profile.noPrflPg === true) {
      newUser.noPrflPg = true;
    } else if (profile.noPrflPg === true) {
      [newUser.noPrflPg, isDiff] = [true, true];
    } else if (oldUser.noPrflPg === true && !('noPrflPg' in profile)) {
      newUser.noPrflPg = true;
    } else if (oldUser.noPrflPg === true) {
      isDiff = true;
    }

    if (isDiff) {
      t.set(ref, userToDoc(newUser));
      console.log(`(${logKey}) Updated to Firestore`);
    } else {
      console.log(`(${logKey}) No diff`);
    }
  });
};

const updateTx = async (logKey, stxAddr, tx) => {
  const ref = db.collection(USERS).doc(stxAddr).collection(TXS).doc(tx.id);

  await db.runTransaction(async (t) => {
    let oldTx, newTx;
    const now = Date.now();

    const snapshot = await t.get(ref);
    if (snapshot.exists) {
      oldTx = docToTx(tx.id, snapshot.data());
      newTx = mergeTxs(oldTx, { tx, updateDate: now });
    } else {
      newTx = { ...tx, createDate: now, updateDate: now };
    }

    const rctdTx = rectifyTx(oldTx, newTx);
    t.set(ref, txToDoc(rctdTx));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const updateUsrShrTx = async (logKey, stxAddr, user, share, tx) => {
  const rRef = db.collection(USERS).doc(stxAddr);

  const userRef = isObject(user) ? rRef : null;
  const shareRef = isObject(share) ? rRef.collection(SHARES).doc(share.id) : null;
  const txRef = rRef.collection(TXS).doc(tx.id);

  const { isToScs } = await db.runTransaction(async (t) => {
    let oldUser, newUser, oldShare, newShare, oldTx, newTx;
    const now = Date.now();

    if (isObject(userRef)) {
      const snapshot = await t.get(userRef);
      if (snapshot.exists) {
        oldUser = docToUser(snapshot.id, snapshot.data());
        newUser = {
          ...oldUser, balance: oldUser.balance + user.balance, updateDate: now,
        };
      } else {
        newUser = {
          stxAddr, balance: user.balance, createDate: now, updateDate: now,
        };
      }
    }
    if (isObject(shareRef)) {
      const snapshot = await t.get(shareRef);
      if (snapshot.exists) {
        oldShare = docToShare(snapshot.id, snapshot.data());
        newShare = {
          ...oldShare,
          amount: oldShare.amount + share.amount,
          cost: oldShare.cost + share.cost,
          updateDate: now,
        };
      } else {
        newShare = { ...share, createDate: now, updateDate: now };
      }
    }
    const snapshot = await t.get(txRef);
    if (snapshot.exists) {
      oldTx = docToTx(snapshot.id, snapshot.data());
      newTx = mergeTxs(oldTx, { ...tx, updateDate: now });
    } else {
      newTx = { ...tx, createDate: now, updateDate: now };
    }

    let isToScs = false;
    if ((!isObject(oldTx) || oldTx.cTxSts !== SCS) && newTx.cTxSts === SCS) {
      if (isObject(userRef)) {
        const rctdUser = rectifyUser(oldUser, newUser);
        t.set(userRef, userToDoc(rctdUser));
      }
      if (isObject(shareRef)) {
        const rctdShare = rectifyShare(oldShare, newShare);
        t.set(shareRef, shareToDoc(rctdShare));
      }

      isToScs = true;
    }

    const rctdTx = rectifyTx(oldTx, newTx);
    t.set(txRef, txToDoc(rctdTx));
    console.log(`(${logKey}) Updated to Firestore`);

    return { isToScs };
  });

  return { isToScs };
};

const getUser = async (stxAddr) => {
  const ref = db.collection(USERS).doc(stxAddr);
  const snapshot = await ref.get();
  if (snapshot.exists) {
    const user = docToUser(stxAddr, snapshot.data());
    return user;
  }
  return null;
};

const getShares = async (stxAddr) => {
  const clt = db.collection(USERS).doc(stxAddr).collection(SHARES);
  const q = clt.where('amount', '>', 0);

  const shares = [];
  const snapshots = await q.get();
  snapshots.forEach(ss => {
    shares.push(docToShare(ss.id, ss.data()));
  });

  return shares;
};

const getTx = async (stxAddr, id) => {
  const ref = db.collection(USERS).doc(stxAddr).collection(TXS).doc(id);
  const snapshot = await ref.get();
  if (snapshot.exists) {
    const tx = docToTx(id, snapshot.data());
    return tx;
  }
  return null;
};

const getTxs = async (stxAddr, ids) => {
  const refs = ids.map(id => {
    return db.collection(USERS).doc(stxAddr).collection(TXS).doc(id);
  });

  const txsPerId = {};
  const snapshots = await db.getAll(...refs);
  snapshots.forEach(ss => {
    if (!ss.exists) return;

    const tx = docToTx(ss.id, ss.data());
    txsPerId[tx.id] = tx;
  });

  const txs = ids.map(id => {
    const tx = txsPerId[id];
    return isObject(tx) ? tx : null;
  });

  return txs;
};

const queryTxs = async (stxAddr: string, quryCrsr: string | null) => {
  const clt = db.collection(USERS).doc(stxAddr).collection(TXS);
  const by = clt.orderBy('createDate', 'desc');

  let q;
  if (isFldStr(quryCrsr)) {
    const ss = await clt.doc(quryCrsr).get();
    q = by.startAt(ss);
  } else {
    q = by;
  }

  const snapshots = [];

  const rawSnapshots = await q.limit(N_DOCS + 1).get();
  rawSnapshots.forEach(ss => {
    snapshots.push(ss);
  });

  const nTxs = snapshots.slice(0, N_DOCS).map(ss => docToTx(ss.id, ss.data()));

  let nQuryCrsr = null;
  if (snapshots.length >= N_DOCS + 1) {
    const ss = snapshots[N_DOCS];
    nQuryCrsr = ss.id;
  }

  return { txs: nTxs, quryCrsr: nQuryCrsr };
};

const updateEvent = async (logKey, evt, doAdd) => {
  const ref = db.collection(EVENTS).doc(evt.id);

  await db.runTransaction(async (t) => {
    let newEvt;

    const snapshot = await t.get(ref);
    if (snapshot.exists) {
      if (doAdd) throw new Error(`Invalid doAdd ${doAdd} with evt.id: ${evt.id}`);

      const oldEvt = docToEvt(evt.id, snapshot.data());
      newEvt = { ...oldEvt, ...evt };
    } else {
      if (!doAdd) throw new Error(`Invalid doAdd ${doAdd} with evt.id: ${evt.id}`);
      newEvt = evt;
    }

    t.set(ref, evtToDoc(newEvt));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const updateSyncEvt = async (logKey, evtId) => {
  const evtRef = db.collection(EVENTS).doc(evtId);
  const syncRef = db.collection(SYNCS).doc(INDEX);

  await db.runTransaction(async (t) => {
    const evtSs = await t.get(evtRef);
    if (!evtSs.exists) throw new Error(`Invalid evtId: ${evtId}`);
    const evt = docToEvt(evtId, evtSs.data());

    let newSync;
    const syncSs = await t.get(syncRef);
    if (syncSs.exists) {
      newSync = docToSync(INDEX, syncSs.data());
      newSync.evts[evt.id] = evt;
    } else {
      newSync = {
        id: INDEX,
        evts: {
          [evt.id]: evt,
        },
      };
    }

    t.set(syncRef, syncToDoc(newSync));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const updateEvtSyncEvt = async (logKey, evt) => {
  const evtRef = db.collection(EVENTS).doc(evt.id);
  const syncRef = db.collection(SYNCS).doc(INDEX);

  await db.runTransaction(async (t) => {
    const evtSs = await t.get(evtRef);
    if (!evtSs.exists) throw new Error(`Evt does not exist: ${evt.id}`);

    const oldEvt = docToEvt(evt.id, evtSs.data());
    const newEvt = structuredClone(oldEvt);
    for (let i = 0; i < evt.outcomes.length; i++) {
      const oc = newEvt.outcomes[i];
      if (!isObject(oc)) throw new Error(`Invalid outcome: ${i} for evtId: ${evt.id}`);
      oc.shareAmount = evt.outcomes[i].shareAmount;
    }

    const syncSs = await t.get(syncRef);
    if (!syncSs.exists) throw new Error(`Sync does not exist: INDEX`);

    const newSync = docToSync(INDEX, syncSs.data());
    newSync.evts[newEvt.id] = newEvt;

    t.set(evtRef, evtToDoc(newEvt));
    t.set(syncRef, syncToDoc(newSync));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const deleteSyncEvt = async (logKey, evtId) => {
  const ref = db.collection(SYNCS).doc(INDEX);

  await db.runTransaction(async (t) => {
    const snapshot = await t.get(ref);
    if (!snapshot.exists) {
      throw new Error(`Not found syncId: ${INDEX}`);
    }

    const newSync = docToSync(INDEX, snapshot.data());
    if (!(evtId in newSync.evts)) {
      throw new Error(`Invalid syncEvtId: ${evtId}`);
    }

    delete newSync.evts[evtId];

    t.set(ref, syncToDoc(newSync));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const getEventBySlug = async (logKey, slug) => {

};

const getEventById = async (logKey, contract, id) => {

};

const uploadFile = async (src, bucket, options) => {
  await getStorage().bucket(bucket).upload(src, options);
};

const data = {
  addLetterJoin, updateProfile, updateTx, updateUsrShrTx, getUser, getShares, getTx,
  getTxs, queryTxs, updateEvent, updateSyncEvt, updateEvtSyncEvt, deleteSyncEvt,
  getEventBySlug, getEventById, uploadFile,
};

export default data;
