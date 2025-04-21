import { produce } from 'immer';

import { UPDATE_PROFILE_EDITOR, RESET_STATE } from '@/types/actionTypes';
import { isString, isNumber } from '@/utils';

const initialState = {
  username: null,
  avatar: null,
  bio: null,
  renderCode: null,
  avlbUsnsFthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  avlbUsns: null,
  avlbAvtsFthSts: null, // null: not yet, 0: fetching, 1: fetched, 2: error
  avlbAvts: null,
  nftOffset: null,
  nftLimit: null,
  nftTotal: null,
  avlbAvtsFthMoreSts: null, // null: not fetching, 0: fetching, 2: error
  saving: null, // null: not saving, true: saving, false: error
};

const profileEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_PROFILE_EDITOR) {
    const {
      username, avatar, bio, renderCode, avlbUsnsFthSts, avlbUsns, avlbAvtsFthSts,
      avlbAvts, avlbAvtsMore, nftOffset, nftLimit, nftTotal, avlbAvtsFthMoreSts, saving,
    } = action.payload;

    if (username === null || isString(username)) draft.username = username;
    if (avatar === null || isString(avatar)) draft.avatar = avatar;

    if (bio === null) draft.bio = bio;
    else if (isString(bio)) draft.bio = bio.slice(0, 160);

    if (renderCode === null || isNumber(renderCode)) draft.renderCode = renderCode;

    if ([null, 0, 1, 2].includes(avlbUsnsFthSts)) {
      draft.avlbUsnsFthSts = avlbUsnsFthSts;
    }
    if (avlbUsns === null) draft.avlbUsns = avlbUsns;
    else if (Array.isArray(avlbUsns)) draft.avlbUsns = structuredClone(avlbUsns);

    if ([null, 0, 1, 2].includes(avlbAvtsFthSts)) {
      draft.avlbAvtsFthSts = avlbAvtsFthSts;
    }
    if (avlbAvts === null) draft.avlbAvts = avlbAvts;
    else if (Array.isArray(avlbAvts)) draft.avlbAvts = structuredClone(avlbAvts);

    if (Array.isArray(avlbAvtsMore) && Array.isArray(draft.avlbAvts)) {
      draft.avlbAvts.push(...structuredClone(avlbAvtsMore));
    }

    if (nftOffset === null || isNumber(nftOffset)) draft.nftOffset = nftOffset;
    if (nftLimit === null || isNumber(nftLimit)) draft.nftLimit = nftLimit;
    if (nftTotal === null || isNumber(nftTotal)) draft.nftTotal = nftTotal;

    if ([null, 0, 2].includes(avlbAvtsFthMoreSts)) {
      draft.avlbAvtsFthMoreSts = avlbAvtsFthMoreSts;
    }
    if ([null, true, false].includes(saving)) draft.saving = saving;
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default profileEditorReducer;
