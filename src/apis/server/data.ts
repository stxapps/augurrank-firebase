import { FieldValue } from 'firebase-admin/firestore';

import {
  fstoreAdmin as db, evtToDoc, syncToDoc, userToDoc,
} from '@/apis/server/fbaseAdmin';
import {
  LETTER_JOINS, USERS, SHARES, TXNS, EVENTS, SYNCS, ACTIVE, INDEX, N_DOCS,
} from '@/types/const';
import { isFldStr, newObject, isAvatarEqual } from '@/utils';
import { docToEvt, docToSync, docToUser, docToTxn } from '@/utils/fbase';

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

const updateTxn = async (logKey, stxAddr, txn) => {

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

const getTxns = async (stxAddr, ids) => {

};

const queryTxns = async (stxAddr: string, quryCrsr: string | null) => {
  const clt = db.collection(USERS).doc(stxAddr).collection(TXNS);
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

  const nTxns = snapshots.slice(0, N_DOCS).map(ss => docToTxn(ss.id, ss.data()));

  let nQuryCrsr = null;
  if (snapshots.length >= N_DOCS + 1) {
    const ss = snapshots[N_DOCS];
    nQuryCrsr = ss.id;
  }

  return { txns: nTxns, quryCrsr: nQuryCrsr };
};

const updateEvent = async (logKey, evt, doAdd) => {
  const ref = db.collection(EVENTS).doc(evt.id);

  await db.runTransaction(async (t) => {
    let newEvt;

    const snapshot = await t.get(ref);
    if (snapshot.exists) {
      if (doAdd) throw new Error(`Invalid doAdd ${doAdd} with slug: ${evt.slug}`);

      const oldEvt = docToEvt(evt.id, snapshot.data());
      newEvt = { ...oldEvt, ...evt };
    } else {
      if (!doAdd) throw new Error(`Invalid doAdd ${doAdd} with slug: ${evt.slug}`);
      newEvt = evt;
    }

    t.set(ref, evtToDoc(newEvt));
    console.log(`(${logKey}) Updated to Firestore`);
  });
};

const getEventBySlug = async (logKey, slug) => {

};

const getEventById = async (logKey, contract, id) => {

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
        }
      }
    }

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

const data = {
  addLetterJoin, updateProfile, updateTxn, getUser, getTxns, queryTxns, updateEvent,
  getEventBySlug, getEventById, updateSyncEvt, deleteSyncEvt,
};

export default data;
