import { produce } from 'immer';

import { UPDATE_PROFILE } from '@/types/actionTypes';

const initialState = {
  stxAddr: null, // null: not yet, empty str: invalid, filled str: valid
  fthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  username: null,
  avatar: null,
  bio: null,
  stats: null,
  txns: {},
  txnQuryCrsr: null,
  txnFthMoreSts: null, // null: not yet, 0: fetching, 2: error
};

const profileReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_PROFILE) {

  }
});

export default profileReducer;
