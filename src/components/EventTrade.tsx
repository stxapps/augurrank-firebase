'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor } from '@/actions/tx';
import { TradeEditor } from '@/components/TradeEditor';
import { EVENT, TX_BUY } from '@/types/const';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventTrade() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { fthSts, id } = useSelector(state => getEventWthSts(state, slug));
  const dispatch = useDispatch();

  useEffect(() => {
    if (fthSts === 1 && isFldStr(id)) {
      dispatch(updateTradeEditor({
        evtId: id, page: EVENT, type: TX_BUY, ocId: 0, value: '',
      }));
    } else {
      dispatch(updateTradeEditor({ evtId: null }));
    }
  }, [slug, fthSts]);

  useEffect(() => {
    return () => {
      dispatch(updateTradeEditor({ evtId: null }));
    };
  }, []);

  let content;
  if (fthSts === 2) { // show error
    content = (
      <div className="mx-auto h-40 max-w-xs bg-slate-700 rounded lg:grow-0 lg:shrink-0 lg:w-2/5" />
    );
  } else if (fthSts === 1) {
    if (isFldStr(id)) { // show content
      content = (
        <div className="mx-auto max-w-xs lg:grow-0 lg:shrink-0 lg:w-2/5">
          <TradeEditor />
          <p className="mt-4 text-sm text-slate-400 text-center">By trading, you agree to the <Link className="underline" href="/terms" target="_blank" rel="noreferrer">Terms of Use</Link>.</p>
        </div>
      );
    } else { // not found
      content = (
        <div className="mx-auto h-40 max-w-xs bg-slate-700 rounded lg:grow-0 lg:shrink-0 lg:w-2/5" />
      );
    }
  } else { // show loading
    content = (
      <div className="mx-auto h-40 max-w-xs bg-slate-700 rounded lg:grow-0 lg:shrink-0 lg:w-2/5 animate-pulse" />
    );
  }

  return content;
}
