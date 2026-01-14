import { FRONTEND_URL } from '@/api/constants'
import { loginResultDTOToUser } from '@/api/dtos/dtosAuth'
import { AuthApi, JwtResult } from '@/api/generated'
import { UserDto } from '@/interfaces/user'
import { Page, expect } from '@playwright/test'
import { Selectors } from '@tests/e2e/helpers/selectors.helper'

export interface TestUser {
	email: string
	password: string
}

export const TEST_USERS = {
	default: {
		email: 'test@test.cz',
		password: 'test',
	},
} as const

export interface LoginOptions {
	email?: string
	password?: string
	api?: boolean
}

/**
 * Login to the application.
 * @param api - if true, login via API (faster), otherwise via UI (default)
 */
export async function login(
	page: Page,
	options: LoginOptions = {}
): Promise<UserDto> {
	const {
		email = TEST_USERS.default.email,
		password = TEST_USERS.default.password,
		api = false,
	} = options

	if (api) {
		return loginApi(page, email, password)
	}

	return loginUI(page, email, password)
}

async function loginUI(
	page: Page,
	email: string,
	password: string
): Promise<UserDto> {
	const sel = new Selectors(page)
	await expect(sel.toolbar.loginButton()).toBeVisible()
	await sel.toolbar.loginButton().click()

	await sel.loginPage.emailInput().fill(email)
	await sel.loginPage.passwordInput().fill(password)

	await sel.loginPage.loginButton().click()

	const loginResponsePromise = page.waitForResponse(
		(resp) => resp.url().includes('/auth/login') && resp.status() === 201
	)

	const loginResponse = await loginResponsePromise
	const responseData: JwtResult = await loginResponse.json()

	await page.waitForURL((url) => !url.pathname.includes('/prihlaseni'))

	return loginResultDTOToUser(responseData)
}

async function loginApi(
	page: Page,
	email: string,
	password: string
): Promise<UserDto> {
	const api = new AuthApi()

	const response = await api.login({ email, password })
	const data = response.data
	const userData = loginResultDTOToUser(data)

	const authCookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME
	if (!authCookieName) {
		throw new Error('Auth cookie name is not defined in environment variables')
	}

	await page.context().addCookies([
		{
			name: authCookieName,
			value: data.token,
			domain: new URL(FRONTEND_URL).hostname,
			path: '/',
			httpOnly: false,
			secure: FRONTEND_URL.startsWith('https'),
			sameSite: 'Lax',
		},
	])

	return userData
}
