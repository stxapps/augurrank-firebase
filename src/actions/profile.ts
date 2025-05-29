import { AppDispatch, AppGetState } from '@/store';
import pflApi from '@/apis/profile';
import { fetchMe } from '@/actions';
import { UPDATE_PROFILE } from '@/types/actionTypes';
import { isObject, isFldStr } from '@/utils';

export const fetchProfile = (stxAddr, doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  if (!isFldStr(stxAddr)) return;

  if (getState().me.stxAddr === stxAddr) {
    dispatch(fetchMe(doForce));
    return;
  }

  let fthSts = null;
  const profileData = getState().profiles[stxAddr];
  if (isObject(profileData)) fthSts = profileData.fthSts;

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateProfile({ stxAddr, fthSts: 0 }));

  let data, isError;
  try {
    data = await pflApi.fetchProfile(stxAddr);
  } catch (error) {
    console.log('fetchProfile error:', error);
    isError = true;
  }

  if (isError) {
    dispatch(updateProfile({ stxAddr, fthSts: 2 }));
    return;
  }

  dispatch(updateProfile({ ...data, fthSts: 1 }));
};

export const updateProfile = (payload) => {
  return { type: UPDATE_PROFILE, payload };
};

export const fetchAvlbUsns = (doForce = false, doLoad = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const fetchAvlbAvts = (doForce = false, doLoad = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const fetchAvlbAvtsMore = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const updateProfileEditor = (payload) => {

};

export const updateProfileData = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};
