import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'
import nextRoutes from 'nextjs-routes/config'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})

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
			webpack(config, { isServer }) {
				config.module.rules.push({
					test: /\.svg$/,
					use: ['@svgr/webpack'],
				})

				// Remove Next.js built-in polyfill-module.js for client bundles.
				// All polyfilled features (Array.prototype.{at,flat,flatMap},
				// Object.{fromEntries,hasOwn}, String.prototype.{trimStart,trimEnd},
				// Symbol.prototype.description, Promise.prototype.finally) are
				// natively supported by our browserslist targets (Chrome 93+,
				// Edge 93+, Firefox 92+, Safari 15.4+).
				// Saves ~11 KiB from the shared JS bundle.
				if (!isServer) {
					config.resolve.alias[
						require.resolve(
							'next/dist/build/polyfills/polyfill-module'
						)
					] = path.resolve(__dirname, 'src/polyfills/empty.js')
				}

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
				// Serve modern image formats: AVIF first (smallest), WebP fallback
				formats: ['image/avif', 'image/webp'],
				// Cache optimized images for 7 days (default is 60s)
				minimumCacheTTL: 60 * 60 * 24 * 7,
				// Responsive breakpoints matching typical device widths
				deviceSizes: [640, 750, 828, 1080, 1200, 1920],
				imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
				dangerouslyAllowSVG: true,
				contentDispositionType: 'attachment',
				contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
			// Re-transpile packages that ship pre-compiled legacy JavaScript
			// (babel class transforms, Object.is polyfills, etc.) to modern targets.
			// SWC re-compiles these using the project's browserslist, converting
			// Babel class helpers to native classes and stripping dead polyfills.
			transpilePackages: ['react-transition-group', 'notistack'],
			experimental: {
				serverComponentsExternalPackages: ['@react-pdf/renderer'],
				optimizePackageImports: [
					'@mui/icons-material',
					'@mui/material',
					'@mui/lab',
					'@mui/x-charts',
					'@mui/x-date-pickers',
					'framer-motion',
					'notistack',
					'dayjs',
					'react-snowfall',
					'@statsig/js-client',
					'@statsig/react-bindings',
					'@statsig/session-replay',
					'@statsig/web-analytics',
					'@react-oauth/google',
					'mixpanel-browser',
					'socket.io-client',
					'jwt-decode',
					'crypto-js',
				],
			},
		})
	)
	return withBundleAnalyzer(nextConfig)
}
