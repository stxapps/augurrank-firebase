import { AppDispatch, AppGetState } from '@/store';

import cmnApi from '@/apis/common';
import {
  UPDATE_EVENTS, UPDATE_EVENT_CHANGES, UPDATE_SYNC, UPDATE_LTRJN_EDITOR,
} from '@/types/actionTypes';
import {
  JOIN_LETTER_JOINING, JOIN_LETTER_INVALID, JOIN_LETTER_COMMIT, JOIN_LETTER_ROLLBACK,
} from '@/types/const';
import { isObject, isFldStr, validateEmail, getEventBySlug } from '@/utils';
import vars from '@/vars';

export const fetchEvents = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const fthSts = getState().events.fthSts;

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateEvents({ fthSts: 0 }));

  let data;
  try {
    data = await cmnApi.fetchEvents(null);
  } catch (error) {
    console.log('fetchEvents error:', error);
    dispatch(updateEvents({ fthSts: 2 }));
    return;
  }

  dispatch(updateEvents({ ...data, fthSts: 1 }));

  await listenSync(dispatch, getState);
};

export const fetchEventsMore = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { quryCrsr, fthMoreSts } = getState().events;

  if (!isFldStr(quryCrsr)) return;
  if (fthMoreSts === 0) return;
  if (!doForce && fthMoreSts !== null) return;
  dispatch(updateEvents({ fthMoreSts: 0 }));

  let data;
  try {
    data = await cmnApi.fetchEvents(quryCrsr);
  } catch (error) {
    console.log('fetchEventsMore error:', error);
    dispatch(updateEvents({ fthMoreSts: 2 }));
    return;
  }

  dispatch(updateEvents({ ...data, fthMoreSts: null }));
};

export const fetchEvent = (slug, doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { entries, slugFthStses } = getState().events;
  const fthSts = slugFthStses[slug] ?? null;

  const event = getEventBySlug(entries, slug);
  if (isObject(event)) {
    dispatch(updateEvents({ slug, slugFthSts: 1 }));
    return;
  }

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateEvents({ slug, slugFthSts: 0 }));

  let data;
  try {
    data = await cmnApi.fetchEventsBySlugs([slug]);
  } catch (error) {
    console.log('fetchEvent error:', error);
    dispatch(updateEvents({ slug, slugFthSts: 2 }));
    return;
  }

  dispatch(updateEvents({ ...data, slug, slugFthSts: 1 }));

  await listenSync(dispatch, getState);
};

export const updateEvents = (payload) => {
  return { type: UPDATE_EVENTS, payload };
};

export const fetchEventChanges = (evtId, doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  if (!isFldStr(evtId)) return;
  const evtChgData = getState().eventChanges[evtId];

  let fthSts = null;
  if (isObject(evtChgData)) fthSts = evtChgData.fthSts;

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateEventChanges({ evtId, fthSts: 0 }));

  let data;
  try {
    data = await cmnApi.fetchEventChanges(evtId, null);
  } catch (error) {
    console.log('fetchEventChanges error:', error);
    dispatch(updateEventChanges({ evtId, fthSts: 2 }));
    return;
  }

  dispatch(updateEventChanges({ ...data, evtId, fthSts: 1 }));
};

export const fetchEventChangesMore = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const updateEventChanges = (payload) => {
  return { type: UPDATE_EVENT_CHANGES, payload };
};

const listenSync = async (dispatch: AppDispatch, getState: AppGetState) => {
  if (vars.listenSync.removeListener) return;
  vars.listenSync.removeListener = cmnApi.listenSync(
    (data) => {
      dispatch(updateSync(data));
    },
    (error) => {
      console.log('listenSync error:', error);
      vars.listenSync.removeListener = null;
    },
  );
};

export const updateSync = (payload) => {
  return { type: UPDATE_SYNC, payload };
};

export const joinLetter = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { email } = getState().ltrjnEditor;

  if (!validateEmail(email)) {
    dispatch(updateLtrjnEditor({
      status: JOIN_LETTER_INVALID, extraMsg: '',
    }));
    return;
  }
  dispatch(updateLtrjnEditor({
    status: JOIN_LETTER_JOINING, extraMsg: '',
  }));

  try {
    await cmnApi.joinLetter(email);
  } catch (error) {
    const extraMsg = error.message;
    dispatch(updateLtrjnEditor({
      status: JOIN_LETTER_ROLLBACK, extraMsg,
    }));
    return;
  }

  dispatch(updateLtrjnEditor({
    status: JOIN_LETTER_COMMIT, extraMsg: '',
  }));
};

export const updateLtrjnEditor = (payload) => {
  return { type: UPDATE_LTRJN_EDITOR, payload };
};
