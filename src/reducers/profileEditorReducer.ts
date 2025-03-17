import { produce } from 'immer';

import { UPDATE_PROFILE_EDITOR, RESET_STATE } from '../types/actionTypes';
import { isString, isNumber } from '@/utils';

const initialState = {
  username: null,
  avatar: null,
  bio: null,
  renderCode: null,
  didFthAvlbUsns: null, // null: not yet, true: fetched, false: error
  avlbUsns: null,
  didFthAvlbAvts: null, // null: not yet, true: fetched, false: error
  avlbAvts: null,
  nftOffset: null,
  nftLimit: null,
  nftTotal: null,
  fthgAvlbAvtsMore: null, // null: not fetching, true: fetching, false: error
  saving: null, // null: not saving, true: saving, false: error
};

const profileEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_PROFILE_EDITOR) {
    const {
      username, avatar, bio, renderCode, didFthAvlbUsns, avlbUsns, didFthAvlbAvts,
      avlbAvts, avlbAvtsMore, nftOffset, nftLimit, nftTotal, fthgAvlbAvtsMore, saving,
    } = action.payload;

    if (username === null || isString(username)) draft.username = username;
    if (avatar === null || isString(avatar)) draft.avatar = avatar;

    if (bio === null) draft.bio = bio;
    else if (isString(bio)) draft.bio = bio.slice(0, 160);

    if (renderCode === null || isNumber(renderCode)) draft.renderCode = renderCode;

    if ([null, true, false].includes(didFthAvlbUsns)) {
      draft.didFthAvlbUsns = didFthAvlbUsns;
    }
    if (avlbUsns === null) draft.avlbUsns = avlbUsns;
    else if (Array.isArray(avlbUsns)) draft.avlbUsns = [...avlbUsns];

    if ([null, true, false].includes(didFthAvlbAvts)) {
      draft.didFthAvlbAvts = didFthAvlbAvts;
    }
    if (avlbAvts === null) draft.avlbAvts = avlbAvts;
    else if (Array.isArray(avlbAvts)) draft.avlbAvts = [...avlbAvts];

    if (Array.isArray(avlbAvtsMore) && Array.isArray(draft.avlbAvts)) {
      draft.avlbAvts = [...draft.avlbAvts, ...avlbAvtsMore];
    }

    if (nftOffset === null || isNumber(nftOffset)) draft.nftOffset = nftOffset;
    if (nftLimit === null || isNumber(nftLimit)) draft.nftLimit = nftLimit;
    if (nftTotal === null || isNumber(nftTotal)) draft.nftTotal = nftTotal;

    if ([null, true, false].includes(fthgAvlbAvtsMore)) {
      draft.fthgAvlbAvtsMore = fthgAvlbAvtsMore;
    }
    if ([null, true, false].includes(saving)) draft.saving = saving;
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default profileEditorReducer;
