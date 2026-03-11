'use server'
import AppClientProviders from '@/app/components/AppClientProviders'
import LazyGoogleOAuthProvider from '@/app/components/LazyGoogleOAuthProvider'
import ThemeProvider from '@/app/providers/ThemeProvider'
import { fetchAllCommonDataServer } from '@/hooks/common-data/fetchCommonDataServer'
import { CookiesProvider } from 'next-client-cookies/server'
import React from 'react'

type AppProvidersProps = {
	children?: React.ReactNode
}

export default async function AppProviders(props: AppProvidersProps) {
	const commonData = await fetchAllCommonDataServer()

	return (
		<>
			<ThemeProvider>
				<CookiesProvider>
					<LazyGoogleOAuthProvider>
						<AppClientProviders test={'ahoj'} initialCommonData={commonData}>
							{props.children}
						</AppClientProviders>
					</LazyGoogleOAuthProvider>
				</CookiesProvider>
			</ThemeProvider>
		</>
	)
}
