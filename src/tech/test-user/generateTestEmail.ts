/**
 * Generates a unique test user email in the format: test[RANDOMHASH]@test.cz
 * Used by the admin "Login as test user" feature to create disposable test accounts.
 */
export function generateTestEmail(): string {
	const hash = Math.random().toString(36).substring(2, 10).toUpperCase()
	return `test${hash}@test.cz`
}
