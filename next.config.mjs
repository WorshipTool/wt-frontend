import createNextIntlPlugin from 'next-intl/plugin'
import nextRoutes from 'nextjs-routes/config'

const BUILD_HASH = `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`

const withRoutes = nextRoutes()
const withNextIntl = createNextIntlPlugin({
	experimental: {
		createMessagesDeclaration: './content/chvalotce.json',
	},
})

// @ts-check
// eslint-disable-next-line import/no-anonymous-default-export
export default (phase, { defaultConfig }) => {
	/** @type {import('next').NextConfig} */
	const nextConfig = withNextIntl(
		withRoutes({
			webpack(config) {
				config.module.rules.push({
					test: /\.svg$/,
					use: ['@svgr/webpack'],
				})
				return config
			},
			env: {
				NEXT_PUBLIC_BUILD_HASH: BUILD_HASH,
			},

			redirects() {
				return [
					{
						source: '/p/:hex/:alias',
						destination: '/pisen/:hex/:alias',
						permanent: true,
					},
				]
			},

			rewrites() {
				return []
			},

			images: {
				remotePatterns: [
					{
						hostname: 'localhost',
					},
					{
						hostname: 'test-chvalotce.cz',
					},
					{
						hostname: 'chvalotce.cz',
					},
					{
						hostname: 'worship.cz',
					},
					{
						hostname: 'worshiptool-end.fly.dev',
					},
					...(process.env.NEXT_PUBLIC_BACKEND_URL
						? [
								{
									hostname: new URL(process.env.NEXT_PUBLIC_BACKEND_URL)
										.hostname,
								},
						  ]
						: []),
					...(process.env.NEXT_PUBLIC_FRONTEND_URL
						? [
								{
									hostname: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL)
										.hostname,
								},
						  ]
						: []),
				],
				dangerouslyAllowSVG: true,
			},
			headers() {
				return [
					{
						// Nastavení hlavičky pro všechny cesty
						source: '/(.*)',
						headers: [
							{
								key: 'Referrer-Policy',
								value: 'strict-origin-when-cross-origin',
							},
						],
					},
				]
			},
			...((() => {
				const p = process.env.NEXT_PUBLIC_FRONTEND_URL
					? new URL(process.env.NEXT_PUBLIC_FRONTEND_URL).pathname
					: ''
				return p && p !== '/' ? { basePath: p } : {}
			})()),
			reactStrictMode: false,
			output: 'standalone',
			experimental: {
				serverComponentsExternalPackages: ['@react-pdf/renderer'],
			},
		})
	)
	return nextConfig
}
