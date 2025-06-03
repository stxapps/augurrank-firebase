import cacheApi from '@/apis/server/cache';
import { Profile } from '@/components/Profile';
import { DOMAIN_NAME } from '@/types/const';
import { isObject, isFldStr } from '@/utils';

export async function generateMetadata(
  { params }: { params: Promise<{ stxAddr: string }> },
) {
  const { stxAddr } = await params;
  const user = await cacheApi.getUser(stxAddr);

  let title = 'Profile not found';
  let description = 'Sorry, we couldn’t find the profile you’re looking for.';
  if (isObject(user)) {
    title = 'A profile of ';
    if (isFldStr(user.username)) title += user.username;
    else title += stxAddr;

    description = 'Stats and history of predictions.';
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

export default async function Page() {
  return <Profile />;
}
