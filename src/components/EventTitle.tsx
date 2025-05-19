'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useSelector, useDispatch } from '@/store';
import { fetchEvent } from '@/actions/common';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventTitle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { fthSts, title } = useSelector(state => getEventWthSts(state, slug));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEvent(slug));
  }, [slug]);

  let content;
  if (fthSts === 2) { // show error
    content = (
      <div className="h-5 w-20 bg-slate-700 rounded" />
    );
  } else if (fthSts === 1) {
    if (isFldStr(title)) { // show content
      content = (
        <h1 className="text-slate-200 text-3xl text-left font-medium text-white">{title}</h1>
      );
    } else { // not found
      content = (
        <h1 className="text-slate-200 text-3xl text-left font-medium text-white">Not found</h1>
      );
    }
  } else { // show loading
    content = (
      <div className="h-5 w-20 bg-slate-700 rounded animate-pulse" />
    );
  }

  return content;
}
