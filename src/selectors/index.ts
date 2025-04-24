import { createSelector } from 'reselect';

import { SCALE } from '@/types/const';
import { isObject, isNumber, isFldStr, parseAvatar } from '@/utils';
import { getShareCosts } from '@/utils/lmsr';

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

export const getEvents = createSelector(
  state => state.events.entries,
  (entries) => {
    let evts = Object.values<any>(entries);
    evts = evts.map(evt => {
      const costs = getShareCosts(evt);
      const oc0Chance = Math.floor((costs[0] * 100) / SCALE);
      const oc0Rot = Math.floor(180 / 100 * oc0Chance);

      let fmtdVol;
      if (isNumber(evt.valVol)) {
        if (evt.valVol >= 1000000) fmtdVol = Math.floor(evt.valVol / 1000000) + 'm';
        else if (evt.valVol >= 100) fmtdVol = Math.floor(evt.valVol / 1000) + 'k';
      }

      return { ...evt, oc0Chance, oc0Rot, fmtdVol };
    });
    evts.sort((a, b) => b.createDate - a.createDate);
    return evts;
  },
);

export const getEvent = createSelector(
  (state, _) => state.events.entries,
  (state, _) => state.events.slug,
  (state, _) => state.events.slugFthSts,
  (_, slug) => slug,
  (entries, slug, slugFthSts, curSlug) => {
    // show loading, event, error

    if (isObject(entries)) {
      // if found an event with the same slug in events, return that event
    }

    if (slug === curSlug && slugFthSts === 2) {
      // show error
    }

    // show loading

    //if (!isFldStr(curSlug) || curSlug !== slug)

    // logic to fetch in useEffect?
  },
);

export const doShowTradeEditor = createSelector(
  state => state.tradeEditor.evtId,
  (_, evtId) => evtId,
  (trdEdtrEvtId, evtId) => {
    return trdEdtrEvtId === evtId;
  },
);

export const getTrdEdtrEvt = createSelector(
  state => state.events.entries,
  state => state.tradeEditor.evtId,
  (entries, evtId) => {
    if (!isFldStr(evtId)) return null;

    const evt = entries[evtId];
    if (!isObject(evt)) return null;

    let costs = getShareCosts(evt);
    costs = costs.map(cost => cost / SCALE);

    return { ...evt, shareCosts: costs };
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
