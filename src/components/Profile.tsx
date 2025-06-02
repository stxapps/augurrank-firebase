import { ProfileTitle } from '@/components/ProfileTitle';
import { ProfileAssets } from '@/components/ProfileAssets';

export function Profile() {
  return (
    <main className="relative mx-auto max-w-3xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
      <ProfileTitle />
      <ProfileAssets />
    </main>
  );
}
