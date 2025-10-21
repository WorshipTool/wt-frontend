import AppProviders from '@/app/components/AppProviders'
import UnavailableMessage from '@/app/components/UnavailableMessage'
import { DragTemplatesContainer } from '@/common/components/DragTemplate/DragTemplateContainer'
import PopupProvider from '@/common/components/Popup/PopupProvider'
import AdminOptionsProvider from '@/common/components/admin/AdminOptions'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from '../../i18n-config'

import Analytics from '@/app/components/components/analytics/Analytics'
import HeadersProviders from '@/app/providers/HeadersProviders'
import './globals.classes.css'
import './globals.css'

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
		<html lang="en">
			<HeadersProviders />
			<Analytics />
			<body>
				<AppRouterCacheProvider>
					<NextIntlClientProvider messages={messages} locale="en">
						<AppProviders>
							{children}
							<PopupProvider />
							<DragTemplatesContainer />
							<AdminOptionsProvider />

							<UnavailableMessage />
						</AppProviders>
					</NextIntlClientProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}