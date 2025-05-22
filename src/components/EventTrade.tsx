'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { updateTradeEditor } from '@/actions/tx';
import { TradeEditor } from '@/components/TradeEditor';
import { TX_BUY } from '@/types/const';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventTrade() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { fthSts, id } = useSelector(state => getEventWthSts(state, slug));
  const dispatch = useDispatch();

  useEffect(() => {
    if (fthSts === 1 && isFldStr(id)) {
      dispatch(updateTradeEditor({ evtId: id, type: TX_BUY, ocId: 0, value: '10' }));
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
      <div className="h-5 w-20 bg-slate-700 rounded" />
    );
  } else if (fthSts === 1) {
    if (isFldStr(id)) { // show content
      content = (
        <div className="mx-auto max-w-xs lg:grow-0 lg:shrink-0 lg:w-2/5">
          <TradeEditor />
        </div>
      );
    } else { // not found
      content = (
        <div className="h-5 w-20 bg-slate-700 rounded" />
      );
    }
  } else { // show loading
    content = (
      <div className="h-5 w-20 bg-slate-700 rounded animate-pulse" />
    );
  }

  return content;
}
