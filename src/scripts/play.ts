import taskApi from '@/apis/server/task';

const play = async () => {
  await taskApi.addSyncEvtTask('augur-markets-t2-0', true, 15000000, 9549200);
};
//play();
