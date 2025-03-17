import { createSelector } from 'reselect';

import { isNumber, isFldStr, parseAvatar } from '@/utils';

const _getInsets = (insetTop, insetRight, insetBottom, insetLeft) => {
  let [top, right, bottom, left] = [0, 0, 0, 0];
  if (isNumber(insetTop)) top = Math.round(insetTop);
  if (isNumber(insetRight)) right = Math.round(insetRight);
  if (isNumber(insetBottom)) bottom = Math.round(insetBottom);
  if (isNumber(insetLeft)) left = Math.round(insetLeft);
  return { left, top, right, bottom };
};

export const getSafeAreaFrame = createSelector(
  state => state.window.width,
  state => state.window.height,
  state => state.window.visualWidth,
  state => state.window.visualHeight,
  state => state.window.insetTop,
  state => state.window.insetRight,
  state => state.window.insetBottom,
  state => state.window.insetLeft,
  (
    windowWidth, windowHeight, visualWidth, visualHeight,
    insetTop, insetRight, insetBottom, insetLeft,
  ) => {

    [windowWidth, windowHeight] = [Math.round(windowWidth), Math.round(windowHeight)];

    let [width, height] = [windowWidth, windowHeight];

    if (isNumber(visualWidth)) {
      visualWidth = Math.round(visualWidth);
      width = visualWidth;
    } else {
      visualWidth = windowWidth;
    }

    if (isNumber(visualHeight)) {
      visualHeight = Math.round(visualHeight);
      height = visualHeight;
    } else {
      visualHeight = windowHeight;
    }

    const assumeKeyboard = windowHeight - visualHeight > 80;

    const insets = _getInsets(insetTop, insetRight, insetBottom, insetLeft);
    width = width - insets.left - insets.right;
    height = height - insets.top - (assumeKeyboard ? 0 : insets.bottom);

    return {
      x: 0, y: 0, width, height, windowWidth, windowHeight, visualWidth, visualHeight,
    };
  },
);

export const getSafeAreaInsets = createSelector(
  state => state.window.insetTop,
  state => state.window.insetRight,
  state => state.window.insetBottom,
  state => state.window.insetLeft,
  (insetTop, insetRight, insetBottom, insetLeft) => {
    const insets = _getInsets(insetTop, insetRight, insetBottom, insetLeft);
    return insets;
  },
);

export const getPflEdtrAvtWthObj = createSelector(
  state => state.meEditor.avatar,
  (str) => {
    const obj = parseAvatar(str);
    return { str, obj };
  },
);

export const getAvlbAvtsWthObj = createSelector(
  state => state.meEditor.avlbAvts,
  (strs) => {
    if (!Array.isArray(strs)) return null;

    const avlbAvts = [], keys = [];
    for (const str of strs) {
      const obj = parseAvatar(str);
      if (!isFldStr(obj.principal) || !isFldStr(obj.id)) continue;

      const key = obj.principal + obj.id;
      if (keys.includes(key)) continue;

      avlbAvts.push({ str, obj });
      keys.push(key);
    }
    return avlbAvts;
  },
);

export const getAvlbAvtsHasMore = createSelector(
  state => state.meEditor.nftOffset,
  state => state.meEditor.nftLimit,
  state => state.meEditor.nftTotal,
  (nftOffset, nftLimit, nftTotal) => {
    if (!isNumber(nftOffset) || !isNumber(nftLimit) || !isNumber(nftTotal)) return null;
    return nftOffset + nftLimit < nftTotal;
  },
);
