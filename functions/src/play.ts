import { Cl } from '@stacks/transactions';
import { GoogleAuth } from 'google-auth-library';

import { getInfo } from '@/info';
import hrAmApi from '@/apis/server/hiroAdmin';
import dataApi from '@/apis/server/data';
import { randomString, getScEvtId } from '@/utils';

const syncEvt = async () => {
  const logger = console;
  const logKey = randomString(12);
  logger.info(`(${logKey}) syncEvt receives a task`);

  const evtId = 'augur-markets-t1-0';
  const isNwTrdr = true;
  const amount = 15000000;
  const cost = 9679082;

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

  const evt = parseData(evtId, isNwTrdr, amount, cost, data);
  try {
    await dataApi.updateEvtSyncEvt(logKey, evt);
  } catch (error) {
    logger.error(`(${logKey}) dataApi.updateEvtSyncEvt error: ${error}`);
    return;
  }
};
const parseData = (evtId, isNwTrdr, amount, cost, data) => {
  return {
    id: evtId,
    outcomes: data.value.ocs.value.map(ocv => {
      const shareAmount = Number(ocv.value.value['share-amount'].value);
      return { shareAmount };
    }),
    qtyVol: amount,
    valVol: cost,
    nTraders: isNwTrdr ? 1 : 0,
  };
};
// syncEvt();

async function getFunctionUrl(name, location = 'us-central1') {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });

  const projectId = await auth.getProjectId();
  const url = 'https://cloudfunctions.googleapis.com/v2beta/' +
    `projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  const res: any = await client.request({ url });
  const uri = res.data?.serviceConfig?.uri;
  console.log('uri', uri);
}
// getFunctionUrl('syncEvt');
