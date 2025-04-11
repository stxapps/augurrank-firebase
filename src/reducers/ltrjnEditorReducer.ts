import { produce } from 'immer';

import { UPDATE_LTRJN_EDITOR, RESET_STATE } from '@/types/actionTypes';
import { JOIN_LETTER_STATUS_INIT } from '@/types/const';

const initialState = {
  status: JOIN_LETTER_STATUS_INIT,
  email: '',
  extraMsg: '',
};

const ltrjnEditorReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_LTRJN_EDITOR) {
    Object.assign(draft, action.payload);
  }

  if (action.type === RESET_STATE) {
    return structuredClone(initialState);
  }
});

export default ltrjnEditorReducer;
