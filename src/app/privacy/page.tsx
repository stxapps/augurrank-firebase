import { DOMAIN_NAME } from '@/types/const';
import { Privacy } from '@/components/Privacy';

const title = 'Privacy Policy - AugurRank';
const description = 'We don\'t rent, sell, or share your information with other companies or advertisers. Our service fee is the only way we make money, so our incentives align with yours.';
export const metadata = {
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

export default function Page() {
  return <Privacy />;
}
