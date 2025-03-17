import Link from 'next/link';

export function Footer() {
  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="pb-4 pt-16 md:flex md:justify-between">
        <div className="-mx-5 -my-2 md:flex md:flex-wrap md:justify-center">
          <div className="mt-1 px-3 py-1 md:mt-0">
            <Link className="block rounded-sm px-2 py-1 text-sm text-slate-400 hover:text-slate-300" href="/terms" prefetch={false}>Terms</Link>
          </div>
          <div className="mt-1 px-3 py-1 md:mt-0">
            <Link className="block rounded-sm px-2 py-1 text-sm text-slate-400 hover:text-slate-300" href="/privacy" prefetch={false}>Privacy</Link>
          </div>
        </div>
        <p className="mt-5 text-left text-sm text-slate-400 md:mt-0">© {(new Date()).getFullYear()} <Link className="rounded-sm text-slate-400 hover:text-slate-300" href="https://www.stxapps.com" target="_blank" rel="noreferrer">STX Apps Co., Ltd.</Link></p>
      </div>
    </div>
  );
}
