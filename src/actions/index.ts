import { AppDispatch, AppGetState } from '@/store';
import idxApi from '@/apis';
import walletApi from '@/apis/wallet';
import {
  INIT, UPDATE_WINDOW, UPDATE_POPUP, UPDATE_WALLET_POPUP, UPDATE_ERROR_POPUP,
  UPDATE_ME, RESET_STATE,
} from '@/types/actionTypes';
import {
  STX_TST_STR, PDG, ABT_BY_NF, ERR_NOT_FOUND, ENRL_ID_SUFFIX,
} from '@/types/const';
import {
  isObject, isNumber, throttle, getWindowInsets, getWalletErrorText, getSignInStatus,
  deriveTxInfo, mergeTxs,
} from '@/utils';
import vars from '@/vars';

let _didInit: boolean;
export const init = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  if (_didInit) return;
  _didInit = true;

  const localMe = idxApi.getLocalMe();
  dispatch({ type: INIT, payload: { ...localMe } });

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

  dispatch(fetchMe());
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
  dispatch(fetchMe());
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

export const fetchMe = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  if (getSignInStatus(getState().me) !== 3) return;

  const { stxAddr, fthSts } = getState().me;

  if (fthSts === 0) return;
  if (!doForce && fthSts !== null) return;
  dispatch(updateMe({ fthSts: 0 }));

  let data, isError;
  try {
    data = await idxApi.fetchMe();
  } catch (error) {
    console.log('fetchMe error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    dispatch(updateMe({ fthSts: 2 }));
    return;
  }

  dispatch(updateMe({ ...data, fthSts: 1 }));
  dispatch(applyEnroll());
};

export const updateMe = (payload) => {
  return { type: UPDATE_ME, payload };
};

export const applyEnroll = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  if (getSignInStatus(getState().me) !== 3) return;

  // cases: 1. first time/no data/no enroll
  //        2. enroll and processing
  //        3. enrolled successfully
  const { stxAddr, balance, enrlFthSts } = getState().me;
  if (isNumber(balance)) return;

  if (enrlFthSts === 0) return;
  if (!doForce && enrlFthSts !== null) return;
  dispatch(updateMe({ enrlFthSts: 0 }));

  let data, isError;
  try {
    data = await idxApi.applyEnroll();
  } catch (error) {
    console.log('applyEnroll error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) return;

  if (isError) {
    dispatch(updateMe({ enrlFthSts: 2 }));
    return;
  }

  dispatch(updateMe({ tx: data, enrlFthSts: 1 }))
  setTimeout(() => {
    dispatch(refreshEnroll());
  }, 1000);
};

const refreshEnroll = (doForce = false) => async (
  dispatch: AppDispatch, getState: AppGetState
) => {
  if (!doForce && vars.refreshEnroll.timeId) return;
  clearTimeout(vars.refreshEnroll.timeId);
  [vars.refreshEnroll.timeId, vars.refreshEnroll.seq] = [null, 0];

  if (getSignInStatus(getState().me) !== 3) return;

  const { stxAddr, balance } = getState().me;
  if (isNumber(balance)) return;

  const enrlId = `${stxAddr}${ENRL_ID_SUFFIX}`;
  const enrlTx = getState().me.txs[enrlId];
  if (enrlTx.cTxSts !== PDG) return;

  vars.refreshEnroll.timeId = PDG;

  let txInfo, isError;
  try {
    txInfo = await idxApi.fetchTxInfo(enrlTx.cTxId);
  } catch (error) {
    if (error.message !== ERR_NOT_FOUND) {
      console.log('refreshEnroll.fetchTxInfo error:', error);
      // server error, network error, do it later or by server.
      isError = true;
    } else if (Date.now() - enrlTx.createDate < 60 * 60 * 1000) {
      txInfo = { tx_id: enrlTx.cTxId, tx_status: PDG };
    } else {
      // Not in mempool anymore like cannot confirm i.e. wrong nonce, not enough fee
      txInfo = { tx_id: enrlTx.cTxId, tx_status: ABT_BY_NF };
    }
  }

  if (getState().me.stxAddr !== stxAddr) {
    [vars.refreshEnroll.timeId, vars.refreshEnroll.seq] = [null, 0];
    return;
  }

  if (isError) {
    setRefreshEnrollTimeout(dispatch);
    return;
  }

  txInfo = deriveTxInfo(txInfo);
  if (txInfo.status === PDG) {
    setRefreshEnrollTimeout(dispatch);
    return;
  }

  const newTx = mergeTxs(enrlTx, { cTxSts: txInfo.status });
  try {
    await idxApi.patchEnroll(newTx);
  } catch (error) {
    console.log('refreshEnroll.patchEnroll error:', error);
    isError = true;
  }

  if (getState().me.stxAddr !== stxAddr) {
    [vars.refreshEnroll.timeId, vars.refreshEnroll.seq] = [null, 0];
    return;
  }

  if (isError) {
    setRefreshEnrollTimeout(dispatch);
    return;
  }

  dispatch(updateMe({ tx: newTx }));
  [vars.refreshEnroll.timeId, vars.refreshEnroll.seq] = [null, 0];
};

const setRefreshEnrollTimeout = (dispatch) => {
  const seq = vars.refreshEnroll.seq;
  const ms = Math.max(Math.min(Math.round(
    (0.8217 * seq ^ 2 + 2.6469 * seq + 5.7343) * 1000
  ), 5 * 60 * 1000), 5 * 1000);
  vars.refreshEnroll.timeId = setTimeout(() => {
    dispatch(refreshEnroll(true));
  }, ms);
  vars.refreshEnroll.seq += 1;
};
