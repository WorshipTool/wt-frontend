export const getStripeSupportUrl = () => {
	if (!process.env.NEXT_PUBLIC_STRIPE_SUPPORT_URL) {
		throw new Error('Missing NEXT_PUBLIC_STRIPE_SUPPORT_URL env variable')
	}
	return process.env.NEXT_PUBLIC_STRIPE_SUPPORT_URL
}
