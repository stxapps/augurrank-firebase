import { slugifyWithCounter } from '@sindresorhus/slugify';

import scApi from '@/apis/server/sc';
import dataApi from '@/apis/server/data';
import { randomString } from '@/utils';

const now = Date.now(), logKey = `${now}-${randomString(4)}`;
const info = scApi.getStacksInfo();
const slugify = slugifyWithCounter();

const evt = {
  title: 'Will STX price more than $1 on 1 May 2025?',
  desc: '',
  beta: 200000000,
  status: 0,
  winOcId: null,
  outcomes: [
    { id: 0, desc: 'Yes', shareAmount: 0 },
    { id: 1, desc: 'No', shareAmount: 0 },
  ],
};
const createEventSc = async () => {
  const res = await scApi.createEvent(evt);
  console.log(`(${logKey}) createEventSc with txid: ${res.txid}`);
};
const createEventDb = async () => {
  const dbEvt = {
    ...evt,
    id: `${info.marketsContract}-0`, // Make sure update contract and id!
    slug: slugify(evt.title),
    createDate: now,
    updateDate: now,
  };
  await dataApi.updateEvent(logKey, dbEvt, true);
  console.log(`(${logKey}) createEventDb finishes`);
};
//createEventSc();
//createEventDb();

const btEvt = { id: 0, beta: 300000000 };
const setEventBetaSc = async () => {
  const res = await scApi.setEventBeta(btEvt.id, btEvt.beta);
  console.log(`(${logKey}) setEventBeta with txid: ${res.txid}`);
};
const setEventBetaDb = async () => {
  const dbBtEvt = { ...btEvt, id: `${info.marketsContract}-${btEvt.id}` };
  await dataApi.updateEvent(logKey, dbBtEvt, false);
  console.log(`(${logKey}) setEventBetaDb finishes`);
};
//setEventBetaSc();
//setEventBetaDb();

const stsEvt = { id: 0, status: 1, winOcId: null };
const setEventStatusSc = async () => {
  const res = await scApi.setEventStatus(stsEvt.id, stsEvt.status, stsEvt.winOcId);
  console.log(`(${logKey}) setEventStatusSc with txid: ${res.txid}`);
};
const setEventStatusDb = async () => {
  const dbStsEvt = { ...stsEvt, id: `${info.marketsContract}-${stsEvt.id}` };
  await dataApi.updateEvent(logKey, dbStsEvt, false);
  console.log(`(${logKey}) setEventStatusDb finishes`);
};
//setEventStatusSc();
//setEventStatusDb();

const updateSyncEvt = async () => {
  await dataApi.updateSyncEvt(logKey, `${info.marketsContract}-0`);
  console.log(`(${logKey}) updateSyncEvt finishes`);
};
//updateSyncEvt();

// buyShares

// sellShares

const payRewards = async () => {

};
//payRewards();

const refundFunds = async () => {

};
//refundFunds();
