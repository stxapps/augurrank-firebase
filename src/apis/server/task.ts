import { funcsAdmin } from '@/apis/server/fbaseAdmin';

const addSyncEvtTask = async (evtId) => {

  // emu vs. test vs. prod?


  const queue = funcsAdmin.taskQueue('syncEvent');
  const targetUri = keys['syncEvent'];

  await queue.enqueue({ evtId }, {
    scheduleDelaySeconds,
    dispatchDeadlineSeconds: 60 * 5, // 5 minutes
    uri: targetUri,
  });
};

const task = { addSyncEvtTask };

export default task;
