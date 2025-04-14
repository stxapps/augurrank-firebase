import { isNotNullIn } from '@/utils';

export const docToEvt = (id, doc) => {
  const evt = {
    id,
    slug: doc.slug,
    title: doc.title,
    desc: doc.desc,
    beta: doc.beta,
    status: doc.status,
    winOcId: doc.winOcId,
    outcomes: doc.outcomes.map(oc => {
      return { id: oc.id, desc: oc.desc, shareAmount: oc.shareAmount };
    }),
    createDate: doc.createDate.toMillis(),
    updateDate: doc.updateDate.toMillis(),
  };
  return evt;
};

export const docToSync = (id, doc) => {
  const sync = { id, evts: {} };
  for (const [evtId, evtDoc] of Object.entries<any>(doc.evts)) {
    sync.evts[evtId] = {
      beta: evtDoc.beta,
      status: evtDoc.status,
      winOcId: evtDoc.winOcId,
      outcomes: evtDoc.outcomes.map(oc => {
        return { id: oc.id, shareAmount: oc.shareAmount };
      }),
      createDate: evtDoc.createDate.toMillis(),
      updateDate: evtDoc.updateDate.toMillis(),
    };
  }
  return sync;
};

export const docToUser = (stxAddr, doc) => {
  const user: any = {
    stxAddr,
    createDate: doc.createDate.toMillis(),
    updateDate: doc.updateDate.toMillis(),
  };
  if (isNotNullIn(doc, 'username')) {
    user.username = doc.username;
    user.usnVrfDt = null;
    if (isNotNullIn(doc, 'usnVrfDt')) user.usnVrfDt = doc.usnVrfDt.toMillis();
  }
  if (isNotNullIn(doc, 'avatar')) {
    user.avatar = doc.avatar;
    user.avtVrfDt = null;
    if (isNotNullIn(doc, 'avtVrfDt')) user.avtVrfDt = doc.avtVrfDt.toMillis();
  }
  if (isNotNullIn(doc, 'bio')) user.bio = doc.bio;
  if (isNotNullIn(doc, 'didAgreeTerms')) user.didAgreeTerms = doc.didAgreeTerms;
  if (isNotNullIn(doc, 'noInLdb')) user.noInLdb = doc.noInLdb;
  if (isNotNullIn(doc, 'noPrflPg')) user.noPrflPg = doc.noPrflPg;

  return user;
};

export const docToShare = (id, doc) => {
  const share = {
    id,
    evtId: doc.evtId,
    ocId: doc.ocId,
    amount: doc.amount,
    avgCost: doc.avgCost,
    createDate: doc.createDate.toMillis(),
    updateDate: doc.updateDate.toMillis(),
  };
  return share;
};

export const docToTxn = (id, doc) => {
  const txn = {

  };
  return txn;
};
