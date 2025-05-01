import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { logger } from 'firebase-functions/v2';
import { Cl } from '@stacks/transactions';

import { getInfo } from '@/info';
import hrAmApi from '@/apis/server/hiroAdmin';
import dataApi from '@/apis/server/data';
import { isFldStr, randomString, getScEvtId } from '@/utils';

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
  },
  async (req) => {
    const logKey = randomString(12);
    logger.info(`(${logKey}) syncEvt receives a task`);

    const { evtId } = req.data;
    logger.info(`(${logKey}) evtId: ${evtId}`);
    if (!isFldStr(evtId)) {
      logger.error(`(${logKey}) Invalid evtId, just end`);
      return;
    }

    const info = getInfo();
    const scEvtId = getScEvtId(evtId);

    let data;
    try {
      data = await hrAmApi.callReadOnly(
        info.stxAddr,
        info.marketsContract,
        'get-b-and-ocs',
        info.stxAddr,
        [Cl.uint(scEvtId), Cl.list([Cl.uint(0), Cl.uint(1)])],
      );
    } catch (error) {
      logger.error(`(${logKey}) hiroApi.callReadOnly error: ${error}`);
      return;
    }

    const evt = parseData(evtId, data);
    try {
      await dataApi.updateEvtSyncEvt(logKey, evt);
    } catch (error) {
      logger.error(`(${logKey}) dataApi.updateEvtSyncEvt error: ${error}`);
      return;
    }
  },
);

const parseData = (id, data) => {
  return {
    id,
    outcomes: data.value.ocs.value.map(ocv => {
      const shareAmount = Number(ocv.value.value['share-amount'].value);
      return { shareAmount };
    }),
  };
};
