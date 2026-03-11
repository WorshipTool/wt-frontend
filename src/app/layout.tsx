import AppProviders from '@/app/components/AppProviders'
import LazyAdminComponents from '@/app/components/LazyAdminComponents'
import UnavailableMessage from '@/app/components/UnavailableMessage'
import { DragTemplatesContainer } from '@/common/components/DragTemplate/DragTemplateContainer'
import PopupProvider from '@/common/components/Popup/PopupProvider'
import { CornerStackProvider } from '@/common/components/CornerStack'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Metadata } from 'next'
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
		verification: {
			google: 'yvbr9ieSeuhugyZcK93MS5Mm3DgYMXqK1EUHYXEHEWs',
		},
	}
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
						</AppProviders>
					</NextIntlClientProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
