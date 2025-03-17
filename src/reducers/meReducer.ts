import { produce } from 'immer';

import { INIT, UPDATE_ME, RESET_STATE } from '../types/actionTypes';

const initialState = {
  stxAddr: null, // null: n/a, '': no value, str: has value
  stxPubKey: null, // same as above
  stxSigStr: null, // same as above
  didFetch: null,
  username: null, // null: n/a, ['': no value, str: has value](fetched at least once)
  avatar: null, // same as above
  bio: null, // same as above
  didAgreeTerms: null, // null or false: n/a or did not agree, true: agreed
};

const meReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === INIT) {
    draft.stxAddr = action.payload.stxAddr;
    draft.stxPubKey = action.payload.stxPubKey;
    draft.stxSigStr = action.payload.stxSigStr;
    draft.username = action.payload.username;
    draft.avatar = action.payload.avatar;
    draft.bio = action.payload.bio;
    draft.didAgreeTerms = action.payload.didAgreeTerms;
  }

  if (action.type === UPDATE_ME) {
    Object.assign(draft, action.payload);
  }

  if (action.type === RESET_STATE) {
    const newState = structuredClone(initialState);
    newState.stxAddr = action.payload.stxAddr;
    newState.stxPubKey = action.payload.stxPubKey;
    newState.stxSigStr = action.payload.stxSigStr;
    return newState;
  }
});

export default meReducer;
