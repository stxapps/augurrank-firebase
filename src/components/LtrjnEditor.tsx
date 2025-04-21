'use client';
import { useSelector, useDispatch } from '@/store';
import { updateLtrjnEditor, joinLetter } from '@/actions/common';
import {
  JOIN_LETTER_INIT, JOIN_LETTER_JOINING, JOIN_LETTER_INVALID,
  JOIN_LETTER_COMMIT, JOIN_LETTER_ROLLBACK,
} from '@/types/const';

const INIT = JOIN_LETTER_INIT;
const JOINING = JOIN_LETTER_JOINING;
const INVALID = JOIN_LETTER_INVALID;
const COMMIT = JOIN_LETTER_COMMIT;
const ROLLBACK = JOIN_LETTER_ROLLBACK;

function getMsg(status) {
  if (status === JOINING) return 'Joining...';
  if (status === INVALID) return 'Invalid email format. Please try again.';
  if (status === COMMIT) return 'Thank you for joining. We\'ll deliver valuable updates to your inbox.';
  if (status === ROLLBACK) return 'Please wait a bit and try again. If the issue persists, please get in touch with us.';
  return '';
}

export function LtrjnEditor() {
  const state = useSelector(state => state.ltrjnEditor);
  const dispatch = useDispatch();

  const onEmailInputChange = async (e) => {
    dispatch(updateLtrjnEditor({
      status: INIT, email: e.target.value, extraMsg: '',
    }));
  };

  const onJoinBtnClick = async () => {
    dispatch(joinLetter());
  };

  return (
    <div className="px-7 pt-8">
      <p className="text-xl font-medium text-slate-100">Stay up to date</p>
      <p className="mt-2.5 text-sm text-slate-400">Get notified when we have something new, and unsubscribe at any time.</p>
      <input className="mt-5 block w-full rounded-full border border-slate-700 bg-slate-700 px-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-400 focus:outline focus:outline-orange-400" onChange={onEmailInputChange} type="email" autoComplete="email" placeholder="Email address" value={state.email} autoCapitalize="none" disabled={[JOINING, COMMIT].includes(state.status)} />
      <div className="min-h-[5.25rem] pb-1.5 pt-3">
        {[INIT, INVALID, ROLLBACK].includes(state.status) && <button onClick={onJoinBtnClick} className="rounded-full bg-orange-400 px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110" disabled={[JOINING, COMMIT].includes(state.status)}>Join</button>}
        {[INVALID, ROLLBACK].includes(state.status) && <p className="pt-1.5 text-sm text-red-500">{getMsg(state.status)}</p>}
        {([ROLLBACK].includes(state.status) && state.extraMsg) && <p className="pt-1.5 text-sm text-red-500">{state.extraMsg}</p>}
        {[JOINING].includes(state.status) && <div className="mt-1 flex">
          <div className="ball-clip-rotate-blk">
            <div />
          </div>
          <p className="ml-2 text-sm text-slate-300">{getMsg(state.status)}</p>
        </div>}
        {[COMMIT].includes(state.status) && <p className="mt-1 text-sm font-medium text-green-500">{getMsg(state.status)}</p>}
      </div>
    </div>
  );
}
