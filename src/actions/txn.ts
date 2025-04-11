import { AppDispatch, AppGetState } from '@/store';
//import idxApi from '@/apis';
//import txnApi from '@/apis/txn';
import { getSignInStatus } from '@/utils';

export const fetchMe = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  const signInStatus = getSignInStatus(getState().me);
  if (signInStatus !== 3) return;


};

export const agreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {

};

export const cancelAgreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {

};
