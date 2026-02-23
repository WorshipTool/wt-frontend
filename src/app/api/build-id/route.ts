export function GET() {
	return Response.json({ hash: process.env.NEXT_PUBLIC_BUILD_HASH })
}
