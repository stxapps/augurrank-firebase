import idxApi from '@/apis';
import walletApi from '@/apis/wallet';
import {
  INIT, UPDATE_WINDOW, UPDATE_ME, UPDATE_POPUP, UPDATE_WALLET_POPUP,
  UPDATE_ERROR_POPUP, RESET_STATE, UPDATE_LTRJN_EDITOR,
} from '@/types/actionTypes';
import {
  STX_TST_STR, VALID, LETTERS_JOINS_PATH, JOIN_NEWSLETTER_STATUS_JOINING,
  JOIN_NEWSLETTER_STATUS_INVALID, JOIN_NEWSLETTER_STATUS_COMMIT,
  JOIN_NEWSLETTER_STATUS_ROLLBACK,
} from '@/types/const';
import {
  isObject, throttle, getWindowInsets, validateEmail, getWalletErrorText,
} from '@/utils';
import vars from '@/vars';

let _didInit;
export const init = () => async (dispatch, getState) => {
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

export const signOut = () => async (dispatch, getState) => {
  const payload = { stxAddr: '', stxPubKey: '', stxSigStr: '' };
  await resetState(payload, dispatch);

  try {
    await walletApi.disconnect();
  } catch (error) {
    console.log('In signOut, error:', error);
  }
};

export const chooseWallet = () => async (dispatch, getState) => {
  const installedWalletIds = walletApi.getInstalledWalletIds();
  if (installedWalletIds.length === 1) {
    dispatch(connectWallet(installedWalletIds[0]));
    return;
  }

  dispatch(updateWalletPopup({ installedWalletIds }));
};

export const connectWallet = (walletId) => async (dispatch, getState) => {
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

export const signStxTstStr = () => async (dispatch, getState) => {
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

  vars.profileEditor.didFthAvlbUsns = false;
  vars.profileEditor.didFthAvlbAvts = false;

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

export const joinLetter = () => async (dispatch, getState) => {
  const { email } = getState().ltrjnEditor;

  if (!validateEmail(email)) {
    dispatch(updateLtrjnEditor({
      status: JOIN_NEWSLETTER_STATUS_INVALID, extraMsg: '',
    }));
    return;
  }

  dispatch(updateLtrjnEditor({
    status: JOIN_NEWSLETTER_STATUS_JOINING, extraMsg: '',
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
        status: JOIN_NEWSLETTER_STATUS_ROLLBACK, extraMsg,
      }));
      return;
    }

    const json = await res.json();
    if (json.status !== VALID) {
      const extraMsg = 'Invalid reqBody or email';
      dispatch(updateLtrjnEditor({
        status: JOIN_NEWSLETTER_STATUS_ROLLBACK, extraMsg,
      }));
      return;
    }

    dispatch(updateLtrjnEditor({
      status: JOIN_NEWSLETTER_STATUS_COMMIT, extraMsg: '',
    }));
  } catch (error) {
    const extraMsg = error.message;
    dispatch(updateLtrjnEditor({
      status: JOIN_NEWSLETTER_STATUS_ROLLBACK, extraMsg,
    }));
  }
};

export const updateLtrjnEditor = (payload) => {
  return { type: UPDATE_LTRJN_EDITOR, payload };
};
