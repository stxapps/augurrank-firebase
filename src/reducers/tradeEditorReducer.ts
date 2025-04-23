import { produce } from 'immer';

import { UPDATE_TRADE_EDITOR, RESET_STATE } from '@/types/actionTypes';
import { isNumber, isString, isFldStr } from '@/utils';

const initialState = {
  evtId: null,
  type: null,
  ocId: null,
  costStr: null,
};

const tradeEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_TRADE_EDITOR) {
    const { evtId, type, ocId, costStr } = action.payload;

    if (evtId === null || isFldStr(evtId)) draft.evtId = evtId;
    if (type === null || isFldStr(type)) draft.type = type;
    if (ocId === null || isNumber(ocId)) draft.ocId = ocId;
    if (costStr === null || isString(costStr)) draft.costStr = costStr;
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default tradeEditorReducer;
