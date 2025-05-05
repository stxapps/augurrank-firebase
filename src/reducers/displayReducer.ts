import { produce } from 'immer';

import {
  UPDATE_POPUP, UPDATE_WALLET_POPUP, UPDATE_ERROR_POPUP, UPDATE_NOTI_POPUP, RESET_STATE,
} from '@/types/actionTypes';
import { AGREE_POPUP } from '@/types/const';

const initialState = {
  isAgreePopupShown: false,
  installedWalletIds: null,
  notiPopupType: null,
  notiPopupTitle: null,
  notiPopupBody: null,
  errorPopupTitle: null,
  errorPopupBody: null,
};

const displayReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_POPUP) {
    const { id, isShown } = action.payload;

    if (id === AGREE_POPUP) {
      draft.isAgreePopupShown = isShown;
    }
  }

  if (action.type === UPDATE_WALLET_POPUP) {
    const { installedWalletIds } = action.payload;

    if (Array.isArray(installedWalletIds)) {
      draft.installedWalletIds = structuredClone(installedWalletIds);
    } else {
      draft.installedWalletIds = null;
    }
  }

  if (action.type === UPDATE_NOTI_POPUP) {
    const { type, title, body } = action.payload;
    draft.notiPopupType = type;
    draft.notiPopupTitle = title;
    draft.notiPopupBody = body;
  }

  if (action.type === UPDATE_ERROR_POPUP) {
    const { title, body } = action.payload;
    [draft.errorPopupTitle, draft.errorPopupBody] = [title, body];
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default displayReducer;
