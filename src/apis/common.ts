import {
  collection, query, where, orderBy, startAt, limit, getDocs, doc, onSnapshot,
} from 'firebase/firestore';

import { getFstore } from '@/apis/fbase';
import {
  LETTERS_JOINS_PATH, EVENTS, CHANGES, SYNCS, INDEX, N_DOCS, N_CHANGES,
} from '@/types/const';
import { isFldStr, getResErrMsg } from '@/utils';
import { docToEvt, docToEvtChg, docToSync } from '@/utils/fbase';
import vars from '@/vars';

const fetchEvents = async (quryCrsr: string) => {
  const clt = collection(getFstore(), EVENTS);
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

  const newEvents = snapshots.slice(0, N_DOCS).map(ss => docToEvt(ss.id, ss.data()));

  let newQuryCrsr = null;
  if (snapshots.length >= N_DOCS + 1) {
    const ss = snapshots[N_DOCS];
    vars.fetchEvents.quryCrsr.id = ss.id;
    vars.fetchEvents.quryCrsr.snapshot = ss;
    newQuryCrsr = vars.fetchEvents.quryCrsr.id;
  }

  return { events: newEvents, quryCrsr: newQuryCrsr };
};

const fetchEventsBySlugs = async (slugs: string[]) => {
  const clt = collection(getFstore(), EVENTS);
  const wh = where('slug', 'in', slugs);
  const q = query(clt, wh);

  const newEvents = [];
  const snapshots = await getDocs(q);
  snapshots.forEach(ss => {
    newEvents.push(docToEvt(ss.id, ss.data()));
  });

  return { events: newEvents };
};

const fetchEventChanges = async (evtId, quryCrsr: string) => {
  const clt = collection(doc(getFstore(), EVENTS, evtId), CHANGES);
  const by = orderBy('createDate', 'desc');
  const lmt = limit(N_CHANGES + 1);

  let q;
  if (isFldStr(quryCrsr)) {
    if (vars.fetchEventChanges.quryCrsr.id !== quryCrsr) {
      throw new Error(`Invalid quryCrsr: ${quryCrsr}`);
    }
    const sa = startAt(vars.fetchEventChanges.quryCrsr.snapshot);
    q = query(clt, by, sa, lmt);
  } else {
    q = query(clt, by, lmt);
  }

  const snapshots = [];

  const rawSnapshots = await getDocs(q);
  rawSnapshots.forEach(ss => {
    snapshots.push(ss);
  });

  const newEvtChgs = snapshots.slice(0, N_CHANGES).map(ss => {
    return docToEvtChg(ss.id, ss.data());
  });

  let newQuryCrsr = null;
  if (snapshots.length >= N_CHANGES + 1) {
    const ss = snapshots[N_CHANGES];
    vars.fetchEventChanges.quryCrsr.id = ss.id;
    vars.fetchEventChanges.quryCrsr.snapshot = ss;
    newQuryCrsr = vars.fetchEventChanges.quryCrsr.id;
  }

  return { eventChanges: newEvtChgs, quryCrsr: newQuryCrsr };
};

const listenSync = async (onSuccess, onError) => {
  const removeListener = onSnapshot(
    doc(getFstore(), SYNCS, INDEX),
    (snapshot) => {
      if (!snapshot.exists()) return;

      const data = docToSync(snapshot.id, snapshot.data());
      onSuccess(data);
    },
    (error) => {
      onError(error);
    },
  );
  return removeListener;
};

const joinLetter = async (email) => {
  const res = await fetch(LETTERS_JOINS_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrerPolicy: 'strict-origin',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const msg = await getResErrMsg(res);
    throw new Error(msg);
  }
};

const common = {
  fetchEvents, fetchEventsBySlugs, fetchEventChanges, listenSync, joinLetter,
};

export default common;
