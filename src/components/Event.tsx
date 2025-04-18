import { EventDetail } from '@/components/EventDetail';

export function Event(props) {
  const { slug } = props;

  return (
    <main className="relative px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
      <p>${slug} not implemented</p>
      <EventDetail />
    </main>
  );
}
