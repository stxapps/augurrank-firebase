import { produce } from 'immer';

import { UPDATE_WINDOW } from '../types/actionTypes';
import { getWindowSize, getWindowInsets } from '../utils';

const [size, insets] = [getWindowSize(), getWindowInsets()];
const initialState = {
  width: size.width,
  height: size.height,
  visualWidth: size.visualWidth,
  visualHeight: size.visualHeight,
  insetTop: insets.top,
  insetRight: insets.right,
  insetBottom: insets.bottom,
  insetLeft: insets.left,
};

const windowReducer = (state = initialState, action) => produce(state, draft => {
  if (action.type === UPDATE_WINDOW) {
    Object.assign(draft, action.payload);
  }
});

export default windowReducer;
