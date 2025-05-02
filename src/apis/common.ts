import {
  collection, query, orderBy, startAt, limit, getDocs, doc, onSnapshot,
} from 'firebase/firestore';

import { getFstore } from '@/apis/fbase';
import { LETTERS_JOINS_PATH, EVENTS, SYNCS, INDEX, N_DOCS } from '@/types/const';
import { isFldStr, getResErrMsg } from '@/utils';
import { docToEvt, docToSync } from '@/utils/fbase';
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

const common = { fetchEvents, fetchEvent, listenSync, joinLetter };

export default common;
