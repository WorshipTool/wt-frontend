export const FORBIDDEN_ERROR_MESSAGE = 'Forbidden'

/**
 * Server side function to throw a forbidden error
 */
export const forbidden = () => {
	throw new Error(FORBIDDEN_ERROR_MESSAGE)
}
