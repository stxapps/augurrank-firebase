import { AppDispatch, AppGetState } from '@/store';
import idxApi from '@/apis';
import walletApi from '@/apis/wallet';
import {
  INIT, UPDATE_WINDOW, UPDATE_ME, UPDATE_POPUP, UPDATE_WALLET_POPUP,
  UPDATE_ERROR_POPUP, RESET_STATE,
} from '@/types/actionTypes';
import { STX_TST_STR } from '@/types/const';
import { isObject, throttle, getWindowInsets, getWalletErrorText } from '@/utils';

let _didInit: boolean;
export const init = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  if (_didInit) return;
  _didInit = true;

  const {
    stxAddr, stxPubKey, stxSigStr, username, avatar, bio, didAgreeTerms,
  } = idxApi.getLocalMe();
  dispatch({
    type: INIT,
    payload: { stxAddr, stxPubKey, stxSigStr, username, avatar, bio, didAgreeTerms },
  });

  window.addEventListener('resize', throttle(() => {
    const insets = getWindowInsets();
    dispatch({
      type: UPDATE_WINDOW,
      payload: {
        width: window.innerWidth,
        height: window.innerHeight,
        insetTop: insets.top,
        insetRight: insets.right,
        insetBottom: insets.bottom,
        insetLeft: insets.left,
      },
    });
  }, 16));
  if (isObject(window.visualViewport)) {
    window.visualViewport.addEventListener('resize', throttle(() => {
      const insets = getWindowInsets();
      dispatch({
        type: UPDATE_WINDOW,
        payload: {
          visualWidth: window.visualViewport.width,
          visualHeight: window.visualViewport.height,
          insetTop: insets.top,
          insetRight: insets.right,
          insetBottom: insets.bottom,
          insetLeft: insets.left,
        },
      });
    }, 16));
  }
};

export const signOut = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  const payload = { stxAddr: '', stxPubKey: '', stxSigStr: '' };
  await resetState(payload, dispatch);

  try {
    await walletApi.disconnect();
  } catch (error) {
    console.log('In signOut, error:', error);
  }
};

export const chooseWallet = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  const installedWalletIds = walletApi.getInstalledWalletIds();
  if (installedWalletIds.length === 1) {
    dispatch(connectWallet(installedWalletIds[0]));
    return;
  }

  dispatch(updateWalletPopup({ installedWalletIds }));
};

export const connectWallet = (walletId) => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  let data;
  try {
    data = await walletApi.connect(walletId);
  } catch (error) {
    console.log('In connectWallet, error:', error);
    if (isObject(error.error) && [4001, -32000].includes(error.error.code)) return;

    dispatch(updateErrorPopup(getWalletErrorText(error.message)));
    return;
  }

  const me = { stxAddr: data.stxAddr, stxPubKey: data.stxPubKey, stxSigStr: '' };
  dispatch(updateMe(me));

  dispatch(signStxTstStr());
};

export const signStxTstStr = () => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  const { stxAddr, stxPubKey } = getState().me;

  let data;
  try {
    data = await walletApi.signMessage(stxPubKey, STX_TST_STR);
  } catch (error) {
    console.log('In signStxTstStr, error:', error);
    if (isObject(error.error) && [4001, -32000].includes(error.error.code)) return;

    dispatch(updateErrorPopup(getWalletErrorText(error.message)));
    return;
  }

  const payload = { stxAddr, stxPubKey, stxSigStr: '' };
  await resetState(payload, dispatch);

  const me = { stxSigStr: data.stxSigStr };
  dispatch(updateMe(me));
};

const resetState = async (payload, dispatch) => {
  idxApi.deleteLocalFiles();

  dispatch({ type: RESET_STATE, payload });
};

export const updatePopup = (id, isShown, anchorPosition) => {
  return {
    type: UPDATE_POPUP,
    payload: { id, isShown, anchorPosition },
  };
};

export const updateWalletPopup = (payload) => {
  return { type: UPDATE_WALLET_POPUP, payload };
};

export const updateErrorPopup = (payload) => {
  return { type: UPDATE_ERROR_POPUP, payload };
};

export const updateMe = (payload) => {
  return { type: UPDATE_ME, payload };
};
