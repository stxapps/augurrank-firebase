import { Cl } from '@stacks/transactions';

import { getInfo } from '@/info';
import hiroApi from '@/apis/hiro';
import dataApi from '@/apis/server/data';
import { randomString, getScEvtId } from '@/utils';

const syncEvt = async () => {
  const logger = console;
  const logKey = randomString(12);
  logger.info(`(${logKey}) syncEvt receives a task`);

  const evtId = 'augur-markets-t1-0';
  const info = getInfo();
  const scEvtId = getScEvtId(evtId);

  let data;
  try {
    data = await hiroApi.callReadOnly(
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
};
const parseData = (id, data) => {
  return {
    id,
    outcomes: data.value.ocs.value.map(ocv => {
      const shareAmount = Number(ocv.value.value['share-amount'].value);
      return { shareAmount };
    }),
  };
};
syncEvt();
