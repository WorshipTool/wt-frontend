'use client'

import { CredentialResponse, useGoogleOneTapLogin } from '@react-oauth/google'
// import Cookies from 'js-cookie'
import { getApiClass } from '@/api/tech-and-hooks/api-classes'
import { AUTH_COOKIE_NAME } from '@/hooks/auth/auth.constants'
import { useClientPathname } from '@/hooks/pathname/useClientPathname'
import { routesPaths } from '@/routes'
import { urlMatchPatterns } from '@/routes/tech/routes.tech'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { isDevelopment } from '@/tech/development.tech'
import { jwtDecode } from 'jwt-decode'
import { useCookies } from 'next-client-cookies'
import { useSnackbar } from 'notistack'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { SignUpRequestDTO, loginResultDTOToUser } from '../../api/dtos/dtosAuth'
import { Configuration, LoginInputData } from '../../api/generated'
import { ROLES, UserDto } from '../../interfaces/user'

export const authContext = createContext<ReturnType<typeof useProvideAuth>>({
	login: async () => {},
	loginWithGoogle: () => {},
	logout: async () => {},
	signup: () => {},
	isLoggedIn: () => false,
	user: undefined,
	info: {} as UserDto,
	reloadInfo: () => {},
	isTrustee: () => false,
	isAdmin: () => false,
	loading: false,
	apiConfiguration: {
		isJsonMime: () => true,
	},
	checkIfCookieExists: () => false,
	changePassword: async (oldPassword: string, newPassword: string) => {},
	resetPassword: async (resetToken: string, newPassword: string) => {},
	sendResetLink: async (email: string) => {},
})

export const AuthProvider = ({ children }: { children: any }) => {
	const auth = useProvideAuth()

	return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export default function useAuth() {
	return useContext(authContext)
}

export function useProvideAuth() {
	// Cookies
	const cookies = useCookies()
	const _setCookie = (user: UserDto) => {
		cookies.set(AUTH_COOKIE_NAME, JSON.stringify(user), {
			domain: `.${process.env.NEXT_PUBLIC_FRONTEND_HOSTNAME}`,
			expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
		})
	}
	const _getCookie = (): UserDto | undefined => {
		const value = cookies.get(AUTH_COOKIE_NAME)
		if (value) {
			return JSON.parse(value)
		}
		return undefined
	}
	const _emptyCookie = () => {
		const hostname = process.env.NEXT_PUBLIC_FRONTEND_HOSTNAME || ''
		// Remove cookie with current domain
		cookies.remove(AUTH_COOKIE_NAME, {
			domain: `.${hostname}`,
		})
		// Also remove cookie without domain (legacy)
		cookies.remove(AUTH_COOKIE_NAME)
		// Also remove parent domain cookie (e.g., .chvalotce.cz when on dev.chvalotce.cz)
		const parts = hostname.split('.')
		if (parts.length > 2) {
			const parentDomain = parts.slice(1).join('.')
			cookies.remove(AUTH_COOKIE_NAME, {
				domain: `.${parentDomain}`,
			})
		}
	}

	// User state
	const [user, setUser] = useState<UserDto | undefined>(_getCookie())
	const token = useMemo(() => user?.token, [user])

	// API configuration
	const apiConfiguration: Configuration = useMemo(
		() => ({
			isJsonMime: () => true,
			accessToken: token,
		}),
		[token],
	)

	const pathname = useClientPathname()
	const navigate = useSmartNavigate()
	const goToHomeIfNeededGoogle = () => {
		// If its on login, or signup page, redirect to home
		const loginPage = urlMatchPatterns(pathname, routesPaths.login)
		const signupPage = urlMatchPatterns(pathname, routesPaths.signup)
		if (loginPage || signupPage) navigate('home', { hledat: undefined })
	}

	// If not logged in, enable Google login
	const [googleShouldLogin, setGoogleShouldLogin] = useState<boolean>(false)
	useGoogleOneTapLogin({
		disabled: !googleShouldLogin,
		onSuccess: (credentialResponse: CredentialResponse) => {
			loginWithGoogle(credentialResponse, goToHomeIfNeededGoogle)
		},
	})
	useEffect(() => {
		if (isDevelopment) return
		if (!_getCookie()) {
			setGoogleShouldLogin(true)
		}
	}, [])

	// Snackbar
	const { enqueueSnackbar } = useSnackbar()

	// API
	const authApi = getApiClass('authApi', apiConfiguration)

	const [loading, setLoading] = useState<boolean>(false)
	const login = async (
		{ email, password }: { email: string; password: string },
		after?: (r: any) => void,
	) => {
		setLoading(true)

		const body: LoginInputData = {
			email,
			password,
		}

		return authApi
			.login(body)
			.then((result) => {
				_innerLogin(loginResultDTOToUser(result))
				if (after) after(result)
			})
			.catch((err) => {
				console.log(err)
				if (after) after(err.response)
			})
			.finally(() => {
				setLoading(false)
			})
	}

	const _innerLogin = (user: UserDto) => {
		enqueueSnackbar(
			`Ahoj ${user.firstName} ${user.lastName}. Ať najdeš, po čem paseš.`,
		)
		setUser(user)
		_setCookie(user)
	}
	const logout = async () => {
		try {
			setLoading(false)
			if (checkIfCookieExists()) await authApi.logout()
		} catch (e) {
			console.error('Logout failed:', e)
		} finally {
			if (user) {
				setUser(undefined)
				// enqueueSnackbar('Byl jsi odhlášen. Zase někdy!')
			}
			setLoading(false)
			_emptyCookie()
		}
	}

	const signup = (data: SignUpRequestDTO, after?: (r: boolean) => void) => {
		setLoading(true)
		const body = data

		authApi
			.signup(body)
			.then((result) => {
				if (after) after(true)
			})
			.catch((err) => {
				console.log(err)
				if (after) after(false)
			})
			.finally(() => {
				setLoading(false)
			})
	}

	const loginWithGoogle = (
		response: CredentialResponse,
		after?: (r: any) => void,
	) => {
		setLoading(true)

		const decoded: any = jwtDecode(response.credential || '')
		const data = {
			userToken: decoded.sub,
			email: decoded.email,
			firstName: decoded.given_name,
			lastName: decoded.family_name,
			picture: decoded.picture,
		}

		authApi
			.loginWithGoogle(data)
			.then((result) => {
				_innerLogin(loginResultDTOToUser(result))
				if (after) after(result)
			})
			.catch((err) => {
				console.log(err)
				if (after) after(err.response)
			})
			.finally(() => {
				setLoading(false)
			})
	}

	const isLoggedIn = useCallback(() => user != undefined, [user])

	// Check if cookie still exists
	const checkIfCookieExists = (): boolean => {
		return _getCookie() !== undefined
	}

	const changePassword = useCallback(
		async (oldPassword: string, newPassword: string) => {
			if (!user) return
			await authApi.changePassword({ newPassword, oldPassword })
		},
		[authApi, user],
	)

	const resetPassword = useCallback(
		async (resetToken: string, newPassword: string) => {
			await authApi.resetPassword({ resetToken, newPassword })
		},
		[authApi],
	)

	const sendResetLink = useCallback(
		async (email: string) => {
			const result = await authApi.sendResetToken(email)
			return result
		},
		[authApi],
	)

	const reloadInfo = useCallback(
		(partialUser: Partial<UserDto>) => {
			_innerLogin({
				...user!,
				...partialUser,
			})
		},
		[user],
	)

	return {
		login,
		logout,
		signup,
		loginWithGoogle,
		isLoggedIn,
		user,
		info: user ? user : ({} as UserDto),
		reloadInfo,
		isTrustee: () => user != undefined && user.role == ROLES.Trustee,
		isAdmin: () => user != undefined && user.role == ROLES.Admin,
		loading,
		apiConfiguration,
		checkIfCookieExists,
		changePassword,
		resetPassword,
		sendResetLink,
	}
}
