import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getFunctions } from 'firebase-admin/functions';

import { isNumber, isFldStr } from '@/utils';

if (isFldStr(process.env.FIRESTORE_EMULATOR_HOST)) {
  if (getApps().length === 0) initializeApp();
} else {
  if (getApps().length === 0) {
    initializeApp({ credential: applicationDefault() });
  }
}

export const fstoreAdmin = getFirestore();
export const funcsAdmin = getFunctions();

export const evtToDoc = (evt) => {
  const doc = {
    slug: evt.slug,
    title: evt.title,
    desc: evt.desc,
    img: evt.img,
    beta: evt.beta,
    status: evt.status,
    winOcId: evt.winOcId,
    outcomes: evt.outcomes.map(oc => {
      return { id: oc.id, desc: oc.desc, shareAmount: oc.shareAmount };
    }),
    qtyVol: evt.qtyVol,
    valVol: evt.valVol,
    nTraders: evt.nTraders,
    closeDate: Timestamp.fromDate(new Date(evt.closeDate)),
    createDate: Timestamp.fromDate(new Date(evt.createDate)),
    updateDate: Timestamp.fromDate(new Date(evt.updateDate)),
  };
  return doc;
};

export const syncToDoc = (sync) => {
  const doc = { evts: {} };
  for (const [evtId, evt] of Object.entries<any>(sync.evts)) {
    doc.evts[evtId] = {
      beta: evt.beta,
      status: evt.status,
      winOcId: evt.winOcId,
      outcomes: evt.outcomes.map(oc => {
        return { id: oc.id, shareAmount: oc.shareAmount };
      }),
      qtyVol: evt.qtyVol,
      valVol: evt.valVol,
      nTraders: evt.nTraders,
      createDate: Timestamp.fromDate(new Date(evt.createDate)),
      updateDate: Timestamp.fromDate(new Date(evt.updateDate)),
    };
  }
  return doc;
};

export const userToDoc = (user) => {
  const doc: any = {
    createDate: Timestamp.fromDate(new Date(user.createDate)),
    updateDate: Timestamp.fromDate(new Date(user.updateDate)),
  };

  if ('username' in user) {
    doc.username = user.username;

    let usnVrfDt = null;
    if (isNumber(user.usnVrfDt)) usnVrfDt = Timestamp.fromDate(new Date(user.usnVrfDt));
    doc.usnVrfDt = usnVrfDt;
  }
  if ('avatar' in user) {
    doc.avatar = user.avatar;

    let avtVrfDt = null;
    if (isNumber(user.avtVrfDt)) avtVrfDt = Timestamp.fromDate(new Date(user.avtVrfDt));
    doc.avtVrfDt = avtVrfDt;
  }
  if ('bio' in user) {
    doc.bio = user.bio;
  }
  if ('didAgreeTerms' in user) {
    doc.didAgreeTerms = user.didAgreeTerms;
  }
  if ('noInLdb' in user) {
    doc.noInLdb = user.noInLdb;
  }
  if ('noPrflPg' in user) {
    doc.noPrflPg = user.noPrflPg;
  }
  if ('balance' in user) {
    doc.balance = user.balance;
  }

  return doc;
};

export const shareToDoc = (share) => {
  const doc = {
    evtId: share.evtId,
    ocId: share.ocId,
    amount: share.amount,
    avgCost: share.avgCost,
    createDate: Timestamp.fromDate(new Date(share.createDate)),
    updateDate: Timestamp.fromDate(new Date(share.updateDate)),
  };
  return doc;
};

export const txToDoc = (tx) => {
  const doc: any = {
    type: tx.type,
    contract: tx.contract,
    createDate: Timestamp.fromDate(new Date(tx.createDate)),
    updateDate: Timestamp.fromDate(new Date(tx.updateDate)),
  };
  if ('evtId' in tx) doc.evtId = tx.evtId;
  if ('ocId' in tx) doc.ocId = tx.ocId;
  if ('amount' in tx) doc.amount = tx.amount;
  if ('cost' in tx) doc.cost = tx.cost;
  if ('cTxId' in tx) doc.cTxId = tx.cTxId;
  if ('pTxSts' in tx) doc.pTxSts = tx.pTxSts;
  if ('cTxSts' in tx) doc.cTxSts = tx.cTxSts;

  return doc;
};

export const stxAccToDoc = (stxAcc) => {
  const doc = {
    nonce: stxAcc.nonce,
    createDate: Timestamp.fromDate(new Date(stxAcc.createDate)),
    updateDate: Timestamp.fromDate(new Date(stxAcc.updateDate)),
  };
  return doc;
};
