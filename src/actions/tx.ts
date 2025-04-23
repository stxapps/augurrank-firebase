import { AppDispatch, AppGetState } from '@/store';
//import idxApi from '@/apis';
//import txApi from '@/apis/tx';
import { UPDATE_TRADE_EDITOR } from '@/types/actionTypes';
import { isNumber, getSignInStatus } from '@/utils';

export const agreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const cancelAgreeTerms = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {

};

export const updateTradeEditor = (payload) => {
  return { type: UPDATE_TRADE_EDITOR, payload };
};

export const trade = () => async (
  dispatch: AppDispatch, getState: AppGetState,
) => {
  const { costStr } = getState().tradeEditor;
  if (!(/^\d+$/.test(costStr))) {
    dispatch(updateTradeEditor({}));
    return;
  }

  const cost = parseInt(costStr, 10); // should parseFloat?
  if (cost <= 0) {

    return;
  }

  if (getSignInStatus(getState().me) !== 3) {
    // If not sign in, show sign in

    return;
  }

  const { balance } = getState().me;
  if (!isNumber(balance)) {

  }
  if (balance === 0) {

  }
  if (cost > balance) {
    // check user balance

    return;
  }
};
