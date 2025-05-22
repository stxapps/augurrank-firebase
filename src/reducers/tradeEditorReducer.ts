import { produce } from 'immer';

import { UPDATE_TRADE_EDITOR, RESET_STATE } from '@/types/actionTypes';
import { isNumber, isString, isFldStr } from '@/utils';

const initialState = {
  page: null,
  evtId: null,
  type: null,
  ocId: null,
  value: null,
  msg: '',
  doLoad: false,
};

const tradeEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_TRADE_EDITOR) {
    const { evtId, type, ocId, value, msg, doLoad } = action.payload;

    if (evtId === null || isFldStr(evtId)) {
      for (const [key, value] of Object.entries(initialState)) draft[key] = value;
      draft.evtId = evtId;
    }
    if (type === null || isFldStr(type)) draft.type = type;
    if (ocId === null || isNumber(ocId)) draft.ocId = ocId;
    if (value === null || isString(value)) draft.value = value;
    if (isString(msg)) draft.msg = msg;
    if ([true, false].includes(doLoad)) draft.doLoad = doLoad;
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default tradeEditorReducer;
