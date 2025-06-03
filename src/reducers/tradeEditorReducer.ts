import { produce } from 'immer';

import { UPDATE_TRADE_EDITOR, RESET_STATE } from '@/types/actionTypes';
import { EVENT, TX_BUY } from '@/types/const';
import { isNumber, isString, isFldStr } from '@/utils';

const initialState = {
  evtId: null,
  page: null,
  type: null,
  ocId: null,
  value: null,
  shdwValue: null,
  msg: '',
  doLoad: false,
};

const tradeEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_TRADE_EDITOR) {
    const { evtId, page, type, ocId, value, shdwValue, msg, doLoad } = action.payload;

    if (evtId === null || isFldStr(evtId)) {
      for (const [key, value] of Object.entries(initialState)) draft[key] = value;
      draft.evtId = evtId;
    }
    if (page === null || isFldStr(page)) draft.page = page;
    if (type === null || isFldStr(type)) draft.type = type;
    if (ocId === null || isNumber(ocId)) draft.ocId = ocId;
    if (value === null || isString(value)) {
      draft.value = value;
      draft.shdwValue = value;
    }
    if (shdwValue === null || isString(shdwValue)) draft.shdwValue = shdwValue;
    if (isString(msg)) draft.msg = msg;
    if ([true, false].includes(doLoad)) draft.doLoad = doLoad;
  }

  if (action.type === RESET_STATE) {
    const { evtId, page } = state;
    if (page === EVENT) {
      return {
        ...structuredClone(initialState),
        evtId, page, type: TX_BUY, ocId: 0, value: '', shdwValue: '',
      };
    }
    return structuredClone(initialState);
  }
});

export default tradeEditorReducer;
