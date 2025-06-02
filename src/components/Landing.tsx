import Link from 'next/link';
import Image from 'next/image';
import { EnvelopeIcon, NewspaperIcon } from '@heroicons/react/24/solid';

import { LandingEvtList } from '@/components/LandingEvtList';
import { LtrjnEditor } from '@/components/LtrjnEditor';
import { TwitterIcon, ThreadsIcon, BSkyIcon, GithubIcon } from '@/components/Icons';
import Logo from '@/images/logo.svg';

export function Landing() {
  return (
    <main className="relative mx-auto max-w-2xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="flex flex-col items-center justify-start sm:flex-row sm:justify-center">
        <div className="rounded-full border-2 border-slate-800 p-2">
          <Image className="size-32" width={128} height={128} src={Logo} alt="" placeholder="empty" priority={true} />
        </div>
        <div className="mt-6 sm:ml-6 sm:mt-0">
          <h1 className="text-center text-5xl font-medium text-white sm:text-left">AugurRank</h1>
          <p className="mt-3 text-center text-xl text-slate-400 sm:text-left">Your vision on chain</p>
        </div>
      </div>
      <LandingEvtList />
      <div className="mt-24 flex justify-center space-x-4">
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
      <LtrjnEditor />
    </main>
  );
}
