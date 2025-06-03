import cacheApi from '@/apis/server/cache';
import { Event } from '@/components/Event';
import { DOMAIN_NAME } from '@/types/const';
import { isObject } from '@/utils';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const evt = await cacheApi.getEvt(slug);

  let title = 'Event not found';
  let description = 'Sorry, we couldn’t find the event you’re looking for.';
  if (isObject(evt)) {
    title = evt.title;

    description = evt.desc;
    description = description.slice(0, 256).split('<')[0].trim();
    if (description.length < evt.desc.length) description += '...';
  }
  return {
    title,
    description,
    twitter: {
      title,
      description,
      site: '@AugurRank',
      images: [DOMAIN_NAME + '/twitter-card-image-pattern1.png'],
      card: 'summary_large_image',
    },
    openGraph: {
      title,
      description,
      siteName: 'AugurRank',
      url: DOMAIN_NAME,
      type: 'article',
      images: [DOMAIN_NAME + '/twitter-card-image-pattern1.png'],
    },
  };
}

export default function Page() {
  return <Event />;
}
