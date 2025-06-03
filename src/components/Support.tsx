import Link from 'next/link';
import { EnvelopeIcon, NewspaperIcon } from '@heroicons/react/24/solid';

import { TwitterIcon, ThreadsIcon, BSkyIcon, GithubIcon } from '@/components/Icons';

export function Support() {

  return (
    <main className="relative px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto max-w-prose">
        <h1 className="text-center text-3xl font-extrabold text-slate-100 sm:text-4xl">Support</h1>
        <p className="mt-5 text-base text-gray-400">Please feel free to contact us.</p>
      </div>
      <div className="mt-20 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="https://x.com/AugurRank" target="_blank" rel="noreferrer">
          <TwitterIcon className="size-5 fill-violet-600 group-hover:fill-violet-500" />
        </Link>
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="https://www.threads.net/@augurrank" target="_blank" rel="noreferrer">
          <ThreadsIcon className="size-[1.125rem] fill-pink-600 group-hover:fill-pink-500" />
        </Link>
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="https://bsky.app/profile/augurrank.com" target="_blank" rel="noreferrer">
          <BSkyIcon className="size-[1.125rem] fill-blue-400 group-hover:fill-blue-300" />
        </Link>
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="https://github.com/stxapps/augurrank-smart-contracts" target="_blank" rel="noreferrer">
          <GithubIcon className="size-5 fill-slate-400 group-hover:fill-slate-300" />
        </Link>
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="&#109;&#097;&#105;&#108;&#116;&#111;:&#115;&#117;&#112;&#112;&#111;&#114;&#116;&#064;&#097;&#117;&#103;&#117;&#114;&#114;&#097;&#110;&#107;&#046;&#099;&#111;&#109;">
          <EnvelopeIcon className="size-5 text-green-500 group-hover:fill-green-400" />
        </Link>
        <Link className="group flex size-10 items-center justify-center rounded-full bg-slate-800" href="https://blog.augurrank.com" target="_blank" rel="noreferrer">
          <NewspaperIcon className="size-5 fill-orange-400 group-hover:fill-orange-300" />
        </Link>
      </div>
    </main>
  );
}
