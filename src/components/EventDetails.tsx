'use client';
import { useParams } from 'next/navigation';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

import { useSelector } from '@/store';
import { getEventWthSts } from '@/selectors';
import { isFldStr } from '@/utils';

export function EventDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { fthSts, desc } = useSelector(state => getEventWthSts(state, slug));

  let content;
  if (fthSts === 2) { // show error
    content = (
      <div className="h-5 w-20 bg-slate-700 rounded" />
    );
  } else if (fthSts === 1) {
    if (isFldStr(desc)) { // show content
      content = (
        <div className="mt-10">
          <InformationCircleIcon className="size-5 text-slate-500" />
          {/* In desc, class="underline" */}
          <p className="mt-1 text-slate-400 text-base" dangerouslySetInnerHTML={{ __html: desc }} />
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
