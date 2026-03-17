'use client'
import React, { useState, useEffect, createContext, useContext } from 'react'

const GOOGLE_CLIENT_ID =
	'736869166999-nckrpcdmab26hkp7s1cjbgdfu51igac9.apps.googleusercontent.com'

type GoogleOAuthProviderComponent = React.ComponentType<{
	clientId: string
	children: React.ReactNode
}>

/**
 * Context holding the lazily-loaded GoogleOAuthProvider component.
 * Consumers use GoogleOAuthScope to wrap themselves when they need the provider,
 * rather than wrapping the entire app tree (which causes remounts).
 */
const GoogleOAuthComponentContext =
	createContext<GoogleOAuthProviderComponent | null>(null)

/**
 * Returns true once the Google OAuth library has been loaded.
 */
export function useGoogleOAuthReady() {
	return useContext(GoogleOAuthComponentContext) !== null
}

/**
 * Provides the lazily-loaded Google OAuth library via context.
 * The tree structure never changes — children are never remounted.
 */
export default function LazyGoogleOAuthProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [Provider, setProvider] =
		useState<GoogleOAuthProviderComponent | null>(null)

	useEffect(() => {
		let cancelled = false
		import('@react-oauth/google')
			.then((mod) => {
				if (!cancelled) {
					setProvider(() => mod.GoogleOAuthProvider)
				}
			})
			.catch((error) => {
				console.error(
					'[LazyGoogleOAuthProvider] Failed to load Google OAuth:',
					error,
				)
			})
		return () => {
			cancelled = true
		}
	}, [])

	return (
		<GoogleOAuthComponentContext.Provider value={Provider}>
			{children}
		</GoogleOAuthComponentContext.Provider>
	)
}

/**
 * Wraps children in GoogleOAuthProvider once the library is loaded.
 * Use this around components that need Google OAuth context
 * (e.g. useGoogleOneTapLogin, GoogleLogin).
 * Returns fallback (default null) while loading.
 */
export function GoogleOAuthScope({
	children,
	fallback = null,
}: {
	children: React.ReactNode
	fallback?: React.ReactNode
}) {
	const Provider = useContext(GoogleOAuthComponentContext)

	if (!Provider) return <>{fallback}</>

	return <Provider clientId={GOOGLE_CLIENT_ID}>{children}</Provider>
}
