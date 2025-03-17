export const dynamic = 'force-static';
//export const revalidate = 60;
//Use revalidatePath('/events'), when there is a new event? or info such as prices update?

export async function GET() {
  return Response.json({ message: 'Hello World' }, {
    headers: {
      'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
      //'Cache-Control': 's-maxage=300, stale-while-revalidate=60', // CDN caches for 5 min, serves stale for 1 min while revalidating
      'Content-Type': 'application/json',
    },
  });
}
