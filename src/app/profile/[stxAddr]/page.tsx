export default async function Page(
  { params }: { params: Promise<{ stxAddr: string }> },
) {
  const { stxAddr } = await params;
  return <div>Profile: {stxAddr}</div>;
}
