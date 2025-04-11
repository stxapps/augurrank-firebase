import { AppDispatch, AppGetState } from '@/store';

import cmnApi from '@/apis/common';
import { UPDATE_EVENTS, UPDATE_LTRJN_EDITOR } from '@/types/actionTypes';
import {
  VALID, LETTERS_JOINS_PATH, JOIN_LETTER_STATUS_JOINING, JOIN_LETTER_STATUS_INVALID,
  JOIN_LETTER_STATUS_COMMIT, JOIN_LETTER_STATUS_ROLLBACK,
} from '@/types/const';
import { isFldStr, validateEmail } from '@/utils';

export const fetchEvents = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
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

  await syncData(dispatch, getState);
};

export const fetchEventsMore = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
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

export const fetchEvent = (slug: string, doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  const { slug, slugFthSts } = getState().events;

  await syncData(dispatch, getState);
};

export const updateEvents = (payload) => {
  return { type: UPDATE_EVENTS, payload };
};

const syncData = async (dispatch: AppDispatch, getState: AppGetState) => {

  // syncData if not sync

};

export const joinLetter = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  const { email } = getState().ltrjnEditor;

  if (!validateEmail(email)) {
    dispatch(updateLtrjnEditor({
      status: JOIN_LETTER_STATUS_INVALID, extraMsg: '',
    }));
    return;
  }

  dispatch(updateLtrjnEditor({
    status: JOIN_LETTER_STATUS_JOINING, extraMsg: '',
  }));
  try {
    const res = await fetch(LETTERS_JOINS_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      referrerPolicy: 'strict-origin',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const extraMsg = res.statusText;
      dispatch(updateLtrjnEditor({
        status: JOIN_LETTER_STATUS_ROLLBACK, extraMsg,
      }));
      return;
    }

    const json = await res.json();
    if (json.status !== VALID) {
      const extraMsg = 'Invalid reqBody or email';
      dispatch(updateLtrjnEditor({
        status: JOIN_LETTER_STATUS_ROLLBACK, extraMsg,
      }));
      return;
    }

    dispatch(updateLtrjnEditor({
      status: JOIN_LETTER_STATUS_COMMIT, extraMsg: '',
    }));
  } catch (error) {
    const extraMsg = error.message;
    dispatch(updateLtrjnEditor({
      status: JOIN_LETTER_STATUS_ROLLBACK, extraMsg,
    }));
  }
};

export const updateLtrjnEditor = (payload) => {
  return { type: UPDATE_LTRJN_EDITOR, payload };
};
