import { createSelector } from 'reselect';

import {
  isObject, isNumber, isFldStr, getEventById, getEventBySlug, parseAvatar, getAvtThbnl,
} from '@/utils';
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
      return { ...evt, costs };
    });
    evts.sort((a, b) => b.createDate - a.createDate);
    return evts;
  },
);

export const getEventWthSts = createSelector(
  (state, _) => state.events.entries,
  (state, _) => state.events.slugFthStses,
  (state, _) => state.eventChanges,
  (_, slug) => slug,
  (entries, slugFthStses, eventChanges, slug) => {
    const fthSts = slugFthStses[slug] ?? null;

    let evt = null, costs = [], chgFthSts = null;
    const chgs = [], chgCds = [];
    if (fthSts === 1) {
      evt = getEventBySlug(entries, slug);
      if (isObject(evt)) {
        costs = getShareCosts(evt);

        const evtChgData = eventChanges[evt.id];
        if (isObject(evtChgData)) {
          chgFthSts = evtChgData.fthSts;
          if (chgFthSts === 1) {
            for (const evtChg of Object.values<any>(evtChgData.entries)) {
              if (chgCds.includes(evtChg.createDate)) continue;
              const costs = getShareCosts(evtChg);
              chgs.push({ ...evtChg, costs });
              chgCds.push(evtChg.createDate);
            }
            chgs.sort((a, b) => a.createDate - b.createDate);
          }
        }
      }
    }

    return { fthSts, ...evt, costs, chgFthSts, chgs };
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

    const costs = getShareCosts(evt);

    return { ...evt, costs };
  },
);

export const getMeAvtWthObj = createSelector(
  state => state.me.avatar,
  (str) => {
    const obj = parseAvatar(str);
    return { str, obj };
  },
);

export const getProfileWthSts = createSelector(
  (state, _) => state.events.entries,
  (state, _) => state.me,
  (state, _) => state.profiles,
  (_, stxAddr) => stxAddr,
  (entries, me, profiles, stxAddr) => {
    let profile;
    if (me.stxAddr === stxAddr) {
      profile = structuredClone(me);
    } else if (isObject(profiles[stxAddr])) {
      profile = structuredClone(profiles[stxAddr]);
    } else {
      profile = { fthSts: null, txFthSts: null };
    }

    profile.avtWthObj = { str: profile.avatar, obj: parseAvatar(profile.avatar) };
    profile.avtThbnl = getAvtThbnl(profile.avtWthObj.obj);

    if (isObject(profile.shares)) {
      profile.shares = Object.values<any>(profile.shares).sort((a, b) => {
        return a.createDate - b.createDate;
      });

      for (const share of profile.shares) {
        const evt = getEventById(entries, share.evtId);
        if (!isObject(evt)) continue;

        if (!isFldStr(share.evtSlug)) share.evtSlug = evt.slug;
        if (!isFldStr(share.evtTitle)) share.evtTitle = evt.title;
        if (!isFldStr(share.evtDesc)) share.evtDesc = evt.desc;
        if (!isFldStr(share.evtImg)) share.evtImg = evt.img;
        if (!isFldStr(share.ocDesc)) share.ocDesc = evt.outcomes[share.ocId].desc;
      }
    }

    return profile;
  },
);

export const getPflEdtrAvtWthObj = createSelector(
  state => state.profileEditor.avatar,
  (str) => {
    const obj = parseAvatar(str);
    return { str, obj };
  },
);

export const getAvlbAvtsWthObj = createSelector(
  state => state.profileEditor.avlbAvts,
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
  state => state.profileEditor.nftOffset,
  state => state.profileEditor.nftLimit,
  state => state.profileEditor.nftTotal,
  (nftOffset, nftLimit, nftTotal) => {
    if (!isNumber(nftOffset) || !isNumber(nftLimit) || !isNumber(nftTotal)) return null;
    return nftOffset + nftLimit < nftTotal;
  },
);
