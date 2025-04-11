import { FieldValue } from 'firebase-admin/firestore';

import { fstoreAdmin as db, userToDoc, evtToDoc } from '@/apis/server/fbaseAdmin';
import { LETTER_JOINS, USERS, SHARES, TXNS, EVENTS, ACTIVE } from '@/types/const';
import { isFldStr, newObject, isAvatarEqual } from '@/utils';
import { docToUser, docToEvt } from '@/utils/fbase';

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

const queryTxns = async (stxAddr, lastId) => {
  const ref = db.collection(USERS).doc(stxAddr).collection(TXNS);
  const snapshots = await ref.orderBy('createDate', 'desc').limit(10).get();


  // need to use the last id to get a snapshot
  //   and use the snapshot with startAfter

  const querySnapshot = await db
    .collection('yourCollection')
    .orderBy('timestamp', 'desc') // Example: order by timestamp
    .limit(pageSize)
    .get();

  const results = [];
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  let lastVisible = null;
  if (results.length > 0) {
    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  }

  const cursor = lastVisible
    ? {
      id: lastVisible.id,
      timestamp: lastVisible.data().timestamp, // Send the field used in orderBy
    }
    : null;

  return { results, cursor };
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

const data = {
  addLetterJoin, updateProfile, updateTxn, getUser, getTxns, queryTxns, updateEvent,
  getEventBySlug, getEventById,
};

export default data;
