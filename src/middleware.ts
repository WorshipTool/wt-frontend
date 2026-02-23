import { FRONTEND_URL } from '@/api/constants'
import {
	AuthApiAxiosParamCreator,
	GetTeamAliasFromSubdomainOutDto,
	TeamGettingApiAxiosParamCreator,
} from '@/api/generated'
import { BASE_PATH } from '@/api/generated/base'
import { AUTH_COOKIE_NAME } from '@/hooks/auth/auth.constants'
import { HEADERS_PATHNAME_NAME } from '@/hooks/pathname/constants'
import { UserDto } from '@/interfaces/user'
import { routesPaths } from '@/routes'
import { getSubdomains } from '@/routes/subdomains/subdomains.tech'
import { shouldUseSubdomains } from '@/routes/tech/routes.tech'
import { getReplacedUrlWithParams } from '@/routes/tech/transformer.tech'
import { safeFetch } from '@/tech/fetch/fetch'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const config = {
	// Exclude everything with dot in the path
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
}

const excludedPaths = ['/_next', '/static', '/manifest', '/public']

// The configured basePath prefix (e.g. "/dev"). Empty string when not set.
const NEXT_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/**
 * Returns the application pathname with the basePath prefix stripped.
 * e.g. "/dev/prihlaseni" → "/prihlaseni" when basePath is "/dev".
 */
const getAppPathname = (pathname: string): string => {
	if (NEXT_BASE_PATH && pathname.startsWith(NEXT_BASE_PATH)) {
		return pathname.slice(NEXT_BASE_PATH.length) || '/'
	}
	return pathname
}

/**
 * This middleware checks if the user is authenticated.
 * All paths with dot in the path are excluded.
 * If the user is not authenticated, it redirects to the login page.
 */
export async function middleware(request: NextRequest) {
	const {
		nextUrl: { pathname },
	} = request

	// Strip basePath prefix so application routing logic works with logical paths
	const appPathname = getAppPathname(pathname)

	// Check if the path is in the excluded paths
	if (excludedPaths.some((path) => appPathname.startsWith(path))) {
		return setResponse(NextResponse.next(), appPathname)
	}

	// Check authentication
	const auth = await checkAuthentication(request, appPathname)

	if (auth.response) return auth.response

	// Subdomains
	if (shouldUseSubdomains()) {
		const checkSub = await checkSubdomain(request, auth.user, appPathname)
		if (checkSub !== true) {
			if (auth.removeAuthCookie) removeAuthCookie(checkSub)
			return checkSub
		}
	} else {
	}

	const url = request.nextUrl.clone()
	const newPathname = await replaceTeamInSubPathname(appPathname)
	if (newPathname !== appPathname) {
		url.pathname = NEXT_BASE_PATH + newPathname
		const r = await setResponse(NextResponse.rewrite(url), newPathname)

		if (auth.removeAuthCookie) removeAuthCookie(r)
		return r
	}

	const a = await setResponse(NextResponse.next(), appPathname)
	if (auth.removeAuthCookie) removeAuthCookie(a)
	return a
}

const setResponse = async (
	response: NextResponse,
	pathname: string
	// cookies: Cookies
): Promise<NextResponse> => {
	// if (r.cookies.get(AUTH_COOKIE_NAME)?.value === '') {
	// 	response.cookies.set(AUTH_COOKIE_NAME, '', {
	// 		expires: new Date(0),
	// 		domain: `.${process.env.NEXT_PUBLIC_FRONTEND_HOSTNAME}`,
	// 	})
	// }

	// if (subdomainsPrefixPathname) {
	// 	response.cookies.set(
	// 		COOKIES_SUBDOMAINS_PATHNAME_NAME,
	// 		subdomainsPrefixPathname
	// 	)
	// }

	response.headers.set(HEADERS_PATHNAME_NAME, pathname)

	return response
}

const checkSubdomain = async (
	request: NextRequest,
	_user?: UserDto,
	appPathname?: string
): Promise<NextResponse | true> => {
	const url = request.nextUrl.clone()
	const host = request.headers.get('host')
	const subdomains = getSubdomains(host)
	if (subdomains.length > 0) {
		let pathname = ''

		for (const subdomain of subdomains) {
			const url = routesPaths['subdomain']
			const aPathname = getReplacedUrlWithParams(
				FRONTEND_URL + url,
				{ subdomain },
				{
					returnSubdomains: 'never',
					returnFormat: 'relative',
				}
			)

			pathname = aPathname + pathname
		}

		const currentAppPathname = appPathname ?? getAppPathname(url.pathname)
		const newAppPathname = await replaceTeamInSubPathname(
			pathname + currentAppPathname
		)
		url.pathname = NEXT_BASE_PATH + newAppPathname

		return setResponse(NextResponse.rewrite(url), pathname)
	}
	return true
}

const removeAuthCookie = (response: NextResponse): NextResponse => {
	response.cookies.set(AUTH_COOKIE_NAME, '', {
		expires: new Date(0),
		domain: `.${process.env.NEXT_PUBLIC_FRONTEND_HOSTNAME}`,
	})
	return response
}

const checkAuthentication = async (
	request: NextRequest,
	appPathname: string
): Promise<{
	user?: UserDto | undefined
	response?: NextResponse
	removeAuthCookie?: boolean
}> => {
	const { cookies } = request
	const tokenCookie = cookies.get(AUTH_COOKIE_NAME)
	let user: UserDto | undefined = undefined
	try {
		user = tokenCookie ? JSON.parse(tokenCookie.value) : undefined
	} catch (e) {}
	const token = user?.token

	if (!token) return {}

	const creator = AuthApiAxiosParamCreator({
		isJsonMime: () => true,
		accessToken: token,
	})

	try {
		const fetchData = await creator.checkTokenExpiration()
		const url = BASE_PATH + fetchData.url
		const result = await safeFetch(url, { ...(fetchData.options as any) })
		if (result.status === 401) {
			throw new Error('Unauthorized, token expired')
		}
	} catch (e) {
		console.log('token expired, going to login', e)
		const loginUrl = request.nextUrl.clone()
		loginUrl.pathname = NEXT_BASE_PATH + '/prihlaseni'
		loginUrl.search = ''
		loginUrl.searchParams.set('previousPage', appPathname)
		const response: NextResponse = await setResponse(
			NextResponse.redirect(loginUrl),
			'/prihlaseni'
		)
		removeAuthCookie(response)

		// Not redirect if the user is already on the login page
		const onLoginPage: boolean = appPathname.startsWith('/prihlaseni')
		if (onLoginPage) {
			return { user, removeAuthCookie: true }
		}

		return { user, response }
	}
	return { user }
}

const replaceTeamInSubPathname = async (pathname: string) => {
	const key = routesPaths.subdomain.split('/')[1]

	const getAlias = async (subdomain: string): Promise<string | null> => {
		const creator = TeamGettingApiAxiosParamCreator({
			isJsonMime: () => true,
		})
		const fetchData = await creator.getAliasBySubdomain(subdomain)

		try {
			const url = BASE_PATH + fetchData.url
			const response = await fetch(url, { ...(fetchData.options as any) })
			if (response.status === 404) return null
			const result: GetTeamAliasFromSubdomainOutDto = await response.json()
			return result.alias
		} catch (e) {
			return null
		}
	}

	const parts = pathname.split('/').filter((part) => part !== '')
	if (parts.length < 2) return pathname

	if (parts[0] !== key) return pathname // Not a subdomain

	const alias = await getAlias(parts[1])
	if (!alias) return pathname

	const teamPathname = getReplacedUrlWithParams(
		routesPaths.team,
		{ alias },
		{
			returnFormat: 'relative',
			returnSubdomains: 'never',
		}
	)

	//replace the first two parts of the path with the team url

	const newPath = teamPathname + '/' + parts.slice(2).join('/')

	return newPath
}