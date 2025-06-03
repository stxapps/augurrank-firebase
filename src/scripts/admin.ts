import { slugifyWithCounter } from '@sindresorhus/slugify';

import { getInfo } from '@/info';
import dataApi from '@/apis/server/data';
import scApi from '@/apis/server/sc';
import { randomString } from '@/utils';

const now = Date.now(), logKey = `${now}-${randomString(4)}`;
const slugify = slugifyWithCounter();

const uploadImage = async () => {
  const info = getInfo();
  const src = '/home/wit/Desktop/stx-logo1.png';
  const bucket = info.bucket;
  const options = {
    destination: 'static/media/stx-logo1.png',
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  };
  await dataApi.uploadFile(src, bucket, options);
  console.log(`(${logKey}) uploaded the image`);
};
//uploadImage();

const evt = {
  title: 'Will STX price more than $1 on 1 Jul 2025?',
  desc: 'More info on https://augurrank.com',
  beta: 300000000,
  status: 1,
  winOcId: null,
  outcomes: [
    { id: 0, desc: 'Yes', shareAmount: 0 },
    { id: 1, desc: 'No', shareAmount: 0 },
  ],
};
const createEventSc = async () => {
  const res = await scApi.createEvent(evt);
  console.log(`(${logKey}) createEventSc with txId: ${res.txId}`);
};
const createEventDb = async () => {
  const info = getInfo();
  const closeDate = new Date('2025-07-01T00:00:00-04:00');
  const dbEvt = {
    ...evt,
    id: `${info.marketsContract}-1`, // Make sure update contract and id!
    slug: slugify(evt.title),
    img: `https://storage.googleapis.com/${info.bucket}/static/media/stx-logo1.png`,
    desc: 'This market will immediately resolve to "Yes" if any Binance 1-minute candle for Stacks (STXUSDT) between July 1, 2025, 00:00 and 23:59 in the ET timezone has a final "High" price of $1.00 or higher. Otherwise, this market will resolve to "No". The resolution source for this market is Binance, specifically the STXUSDT "High" prices available at <a class="underline" href="https://www.binance.com/en/trade/STX_USDT">binance.com/en/trade/STX_USDT</a>, with the chart settings on "1m" for one-minute candles selected on the top bar. Please note that the outcome of this market depends solely on the price data from the Binance STXUSDT trading pair. Prices from other exchanges, different trading pairs, or spot markets will not be considered for the resolution of this market.',
    qtyVol: 0,
    valVol: 0,
    nTraders: 0,
    closeDate: closeDate.getTime(),
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
  console.log(`(${logKey}) setEventBeta with txId: ${res.txId}`);
};
const setEventBetaDb = async () => {
  const info = getInfo();
  const dbBtEvt = { ...btEvt, id: `${info.marketsContract}-${btEvt.id}` };
  await dataApi.updateEvent(logKey, dbBtEvt, false);
  console.log(`(${logKey}) setEventBetaDb finishes`);
};
//setEventBetaSc();
//setEventBetaDb();

const stsEvt = { id: 0, status: 3, winOcId: 1 };
const setEventStatusSc = async () => {
  const res = await scApi.setEventStatus(stsEvt.id, stsEvt.status, stsEvt.winOcId);
  console.log(`(${logKey}) setEventStatusSc with txId: ${res.txId}`);
};
const setEventStatusDb = async () => {
  const info = getInfo();
  const dbStsEvt = { ...stsEvt, id: `${info.marketsContract}-${stsEvt.id}` };
  await dataApi.updateEvent(logKey, dbStsEvt, false);
  console.log(`(${logKey}) setEventStatusDb finishes`);
};
//setEventStatusSc();
//setEventStatusDb();

const updateSyncEvt = async () => {
  const info = getInfo();
  await dataApi.updateSyncEvt(logKey, `${info.marketsContract}-1`);
  console.log(`(${logKey}) updateSyncEvt finishes`);
};
//updateSyncEvt();

// buyShares

// sellShares

const payRewardsSc = async () => {
  const keys = [
    { evtId: 0, userId: '' },
  ];
  const res = await scApi.payRewards(keys);
  console.log(`(${logKey}) payRewardsSc with txId: ${res.txId}`);
};
const payRewardsDb = async () => {
  // update balance to all winners
  // set share zero to all participants
  const stxAddr = '';
  const user = { balance: 1005450400, updateDate: now };
  const share = {
    id: `${stxAddr}-augur-markets-t2-0-1`,
    amount: 0,
    cost: 0,
    updateDate: now,
  };
  await dataApi.updateUsrShr(logKey, stxAddr, user, share);
};
//payRewardsSc();
//payRewardsDb();

const refundFunds = async () => {

};
//refundFunds();
