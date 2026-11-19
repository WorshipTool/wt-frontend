import type { ErrorEvent, EventHint } from '@sentry/nextjs'
import { FORBIDDEN_ERROR_MESSAGE } from './error.tech'

// Frames from scripts that aren't ours (Google Sign-In, injected bot/extension
// code). Errors thrown there say nothing about our app.
const THIRD_PARTY_FRAME_MARKERS = ['/gsi/client', 'obscura:']

/**
 * Errors that are expected behaviour, not bugs, and only add noise:
 * - `forbidden()` — a visitor without access hit a protected page (admin).
 * - errors whose top stack frame is a third-party script.
 */
export const isIgnoredSentryEvent = (
	event: ErrorEvent,
	hint?: EventHint
): boolean => {
	const original = hint?.originalException
	if (original instanceof Error && original.message === FORBIDDEN_ERROR_MESSAGE)
		return true

	const exception = event.exception?.values?.[0]
	if (
		exception?.type === 'Error' &&
		exception.value === FORBIDDEN_ERROR_MESSAGE
	)
		return true

	const frames = exception?.stacktrace?.frames
	const topFrame = frames?.[frames.length - 1]
	const topFile = topFrame?.filename ?? ''
	if (THIRD_PARTY_FRAME_MARKERS.some((marker) => topFile.includes(marker)))
		return true

	return false
}

/** Shared `beforeSend` for all Sentry runtimes. */
export const sentryBeforeSend = (event: ErrorEvent, hint: EventHint) =>
	isIgnoredSentryEvent(event, hint) ? null : event
