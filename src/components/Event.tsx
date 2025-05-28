import { EventTitle } from '@/components/EventTitle';
import { EventChart } from '@/components/EventChart';
import { EventTrade } from '@/components/EventTrade';
import { EventDetails } from '@/components/EventDetails';

export function Event() {
  return (
    <main className="relative mx-auto max-w-3xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
      <EventTitle />
      <div className="mt-10 lg:flex lg:space-x-5">
        <EventChart />
        <EventTrade />
      </div>
      <EventDetails />
    </main>
  );
}
