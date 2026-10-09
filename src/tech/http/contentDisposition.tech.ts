/**
 * The `Content-Disposition` header for a file whose name is a song or playlist
 * title — which is to say, Czech.
 *
 * A header is ASCII, so a non-ASCII name needs `filename*` (RFC 5987/6266):
 * percent-encoded, announced as UTF-8, and paired with a plain `filename` that
 * anything too old to read the starred one can still use. Percent-encoding the
 * plain one instead, which is what this used to do, is not an encoding at all —
 * the browser has no way to know it should decode it, so it takes the escapes
 * literally and you save `10%20000%20d%C5%AFvod%C5%AF.pdf`.
 *
 * Nobody noticed while the PDF only ever opened in a viewer. It became visible
 * the moment the installed app started downloading it instead.
 */
export const contentDisposition = (
	type: 'inline' | 'attachment',
	name: string
) => {
	const encoded = encodeURIComponent(name)
	// the fallback has to survive being read as ASCII, and must not carry a
	// quote or a backslash into the quoted string
	const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')
	return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`
}
