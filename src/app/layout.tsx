import AppProviders from '@/app/components/AppProviders'
import AppUpdater from '@/app/components/AppUpdater'
import LazyAdminComponents from '@/app/components/LazyAdminComponents'
import RegisterServiceWorker from '@/app/components/RegisterServiceWorker'
import UnavailableMessage from '@/app/components/UnavailableMessage'
import { DragTemplatesContainer } from '@/common/components/DragTemplate/DragTemplateContainer'
import PopupProvider from '@/common/components/Popup/PopupProvider'
import { CornerStackProvider } from '@/common/components/CornerStack'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { Roboto } from 'next/font/google'
import { getMessages } from '../../i18n-config'

import HeadersProviders from '@/app/providers/HeadersProviders'
import dynamic from 'next/dynamic'

const Analytics = dynamic(
	() => import('@/app/components/components/analytics/Analytics'),
	{ ssr: false }
)
import './globals.classes.css'
import './globals.css'

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-roboto',
	preload: true,
})

export async function generateMetadata(): Promise<Metadata> {
	const messages = await getMessages()
	return {
		title: messages.config.branding.appName,
		description: messages.config.branding.appDescription,
		keywords: [
			'songbook',
			'worship',
			'chords',
			'song',
			'lyrics',
			'playlist',
			'christian',
			'music',
		],
		manifest: '/manifest.webmanifest',
		appleWebApp: {
			capable: true,
			statusBarStyle: 'default',
			title: messages.config.branding.shortName,
		},
		verification: {
			google: 'yvbr9ieSeuhugyZcK93MS5Mm3DgYMXqK1EUHYXEHEWs',
		},
	}
}

// theme_color for the browser/OS chrome (matches the manifest) + sensible
// mobile viewport defaults for the installed app.
// `viewportFit: 'cover'` is what makes `env(safe-area-inset-*)` resolve to the
// real notch/home-indicator sizes — without it iOS reports 0 for all of them and
// the app shell's safe-area padding silently does nothing.
export const viewport: Viewport = {
	themeColor: '#0085FF',
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const messages = await getMessages()

	return (
		<html lang="en" className={`${roboto.variable} ${roboto.className}`}>
			<HeadersProviders />
			<Analytics />
			<body>
				<AppRouterCacheProvider>
					<NextIntlClientProvider messages={messages} locale="en">
						<AppProviders>
							{children}
							<PopupProvider />
							<CornerStackProvider />
							<DragTemplatesContainer />
							<LazyAdminComponents />
							<UnavailableMessage />
							<AppUpdater />
							<RegisterServiceWorker />
						</AppProviders>
					</NextIntlClientProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
