import { unstable_cache } from 'next/cache';

import dataApi from '@/apis/server/data';

const getUser = unstable_cache(
  async (stxAddr: string) => {
    const user = await dataApi.getUser(stxAddr);
    return user;
  },
  ['user'],
  { revalidate: 3600, tags: ['user'] },
);

const getEvt = unstable_cache(
  async (slug: string) => {
    const evt = await dataApi.getEventBySlug(slug);
    return evt;
  },
  ['event'],
  { revalidate: 3600, tags: ['event'] },
);

const cache = { getUser, getEvt };

export default cache;
