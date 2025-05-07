import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions/v2';
import { Cl } from '@stacks/transactions';

import { getInfo } from '@/info';
import hrAmApi from '@/apis/server/hiroAdmin';
import dataApi from '@/apis/server/data';
import { isNumber, isFldStr, randomString, getScEvtId } from '@/utils';

export const syncEvt = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 1,
      minBackoffSeconds: 1,
    },
    rateLimits: {
      maxConcurrentDispatches: 1,
      maxDispatchesPerSecond: 1,
    },
    secrets: ['HIRO_API_KEY'],
  },
  async (req) => {
    const logKey = randomString(12);
    logger.info(`(${logKey}) syncEvt receives a task`);

    const { evtId, isNwTrdr, amount, cost } = req.data;
    logger.info(`(${logKey}) evtId: ${evtId}, isNwTrdr: ${isNwTrdr}`);
    logger.info(`(${logKey}) amount: ${amount}, cost: ${cost}`);
    if (!isFldStr(evtId) || ![true, false].includes(isNwTrdr)) {
      logger.error(`(${logKey}) Invalid evtId or isNwTrdr, just end`);
      return;
    }
    if (!isNumber(amount) || !isNumber(cost)) {
      logger.error(`(${logKey}) Invalid amount or cost, just end`);
      return;
    }

    const info = getInfo();
    const scEvtId = getScEvtId(evtId);

    let data;
    try {
      data = await hrAmApi.callReadOnly(
        info.stxAddr,
        info.marketsContract,
        'get-share-amounts',
        info.stxAddr,
        [Cl.uint(scEvtId)],
      );
    } catch (error) {
      logger.error(`(${logKey}) hiroApi.callReadOnly error: ${error}`);
      return;
    }

    const evt = parseData(evtId, isNwTrdr, amount, cost, data);
    try {
      await dataApi.updateEvtSyncEvt(logKey, evt);
    } catch (error) {
      logger.error(`(${logKey}) dataApi.updateEvtSyncEvt error: ${error}`);
      return;
    }
  },
);

const parseData = (evtId, isNwTrdr, amount, cost, data) => {
  return {
    id: evtId,
    outcomes: data.value.amounts.value.map(amount => {
      const shareAmount = Number(amount.value);
      return { shareAmount };
    }),
    qtyVol: amount,
    valVol: cost,
    nTraders: isNwTrdr ? 1 : 0,
  };
};
