import { DOMAIN_NAME } from '@/types/const';
import { Terms } from '@/components/Terms';

const title = 'Terms of Service - AugurRank';
const description = 'By accessing, browsing, or using our websites, apps, or services offered by STX Apps Co., Ltd., you acknowledge that you have read and understood and agree to be bound by these Terms of Service.';
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
  return <Terms />;
}
