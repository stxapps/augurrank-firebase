import { getFuncsAdmin } from '@/apis/server/fbaseAdmin';

const addSyncEvtTask = async (evtId, isNwTrdr, amount, cost) => {
  const name = process.env.FUNCTION_SYNC_EVT_NAME;
  const uri = process.env.FUNCTION_SYNC_EVT_URI;

  const queue = getFuncsAdmin().taskQueue(name);
  await queue.enqueue({ evtId, isNwTrdr, amount, cost }, { uri: uri });
};

const task = { addSyncEvtTask };

export default task;
