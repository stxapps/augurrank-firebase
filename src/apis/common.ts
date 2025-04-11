import {
  collection, query, orderBy, startAt, limit, getDocs, doc, onSnapshot,
} from 'firebase/firestore';

import { fstore as db } from '@/apis/fbase';
import { EVENTS, SYNC_DATA } from '@/types/const';
import { docToEvt, docToSyncData } from '@/utils/fbase';
import { isFldStr } from '@/utils';
import vars from '@/vars';

const N_DOCS = 10;

const fetchEvents = async (quryCrsr: string) => {
  const clt = collection(db, EVENTS);
  const by = orderBy('createDate', 'desc');
  const lmt = limit(N_DOCS + 1);

  let q;
  if (isFldStr(quryCrsr)) {
    if (vars.fetchEvents.quryCrsr.id !== quryCrsr) {
      throw new Error(`Invalid quryCrsr: ${quryCrsr}`);
    }
    const sa = startAt(vars.fetchEvents.quryCrsr.snapshot);
    q = query(clt, by, sa, lmt);
  } else {
    q = query(clt, by, lmt);
  }

  const snapshots = [];

  const rawSnapshots = await getDocs(q);
  rawSnapshots.forEach(ss => {
    snapshots.push(ss);
  });

  const nEvents = snapshots.slice(0, N_DOCS).map(ss => docToEvt(ss.id, ss.data()));

  let nQuryCrsr = null;
  if (snapshots.length >= N_DOCS + 1) {
    const ss = snapshots[N_DOCS];
    vars.fetchEvents.quryCrsr.id = ss.id;
    vars.fetchEvents.quryCrsr.snapshot = ss;
    nQuryCrsr = vars.fetchEvents.quryCrsr.id;
  }

  return { events: nEvents, quryCrsr: nQuryCrsr };
};

const fetchEvent = async (slug: string) => {

};

const listenSyncData = async (callback) => {
  const removeListener = onSnapshot(
    doc(db, SYNC_DATA, 'index'),
    (snapshot) => {
      let syncData = null;
      if (snapshot.exists()) syncData = docToSyncData(snapshot.id, snapshot.data());
      callback(syncData);
    },
    (error) => {
      callback(null, error);
    });
  return removeListener;
};

const common = { fetchEvents, fetchEvent, listenSyncData };

export default common;
