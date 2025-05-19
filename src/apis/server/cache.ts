import { unstable_cache } from 'next/cache';

import dataApi from '@/apis/server/data';

const getEvt = unstable_cache(
  async (slug: string) => {
    const evt = await dataApi.getEventBySlug(slug);
    return evt;
  },
  ['event'],
  { revalidate: 3600, tags: ['event'] },
)

const cache = { getEvt };

export default cache;
