export async function GET(
  request: Request,
  { params }: { params: Promise<{ stxAddr: string }> },
) {
  const { stxAddr } = await params;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ stxAddr: string }> },
) {
  const { stxAddr } = await params;

  // get pubKey, test str, sigStr from body to authen?
  // or get from header Authorization?

  // Update username, avatar, and bio
}
