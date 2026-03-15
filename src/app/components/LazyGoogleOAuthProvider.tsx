'use client'
import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'

const GoogleOAuthProviderLazy = dynamic(
	() =>
		import('@react-oauth/google').then((mod) => {
			const { GoogleOAuthProvider } = mod
			return function LazyProvider({
				children,
			}: {
				children: React.ReactNode
			}) {
				return (
					<GoogleOAuthProvider clientId="736869166999-nckrpcdmab26hkp7s1cjbgdfu51igac9.apps.googleusercontent.com">
						{children}
					</GoogleOAuthProvider>
				)
			}
		}),
	{
		ssr: false,
		loading: () => null,
	}
)

export default function LazyGoogleOAuthProvider({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Suspense fallback={null}>
			<GoogleOAuthProviderLazy>{children}</GoogleOAuthProviderLazy>
		</Suspense>
	)
}
