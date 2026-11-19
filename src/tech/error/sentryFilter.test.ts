import type { ErrorEvent } from '@sentry/nextjs'
import { forbidden } from './error.tech'
import { isIgnoredSentryEvent, sentryBeforeSend } from './sentryFilter'

const eventWith = (
	type: string,
	value: string,
	topFile?: string
): ErrorEvent =>
	({
		type: undefined,
		exception: {
			values: [
				{
					type,
					value,
					stacktrace: topFile
						? { frames: [{ filename: 'app:///first.js' }, { filename: topFile }] }
						: undefined,
				},
			],
		},
	}) as ErrorEvent

const thrownBy = (fn: () => void): Error => {
	try {
		fn()
	} catch (e) {
		return e as Error
	}
	throw new Error('did not throw')
}

describe('isIgnoredSentryEvent', () => {
	it('ignores the error thrown by forbidden() (via hint)', () => {
		const err = thrownBy(forbidden)
		expect(
			isIgnoredSentryEvent(eventWith('Error', err.message), {
				originalException: err,
			})
		).toBe(true)
	})

	it('ignores a Forbidden error event without hint', () => {
		expect(isIgnoredSentryEvent(eventWith('Error', 'Forbidden'))).toBe(true)
	})

	it.each(['app:///gsi/client', '<obscura:bootstrap>'])(
		'ignores errors thrown from third-party script %s',
		(file) => {
			expect(isIgnoredSentryEvent(eventWith('Error', 'pa', file))).toBe(true)
		}
	)

	it('keeps real errors', () => {
		expect(
			isIgnoredSentryEvent(
				eventWith('TypeError', 'x is undefined', 'app:///_next/static/chunks/a.js')
			)
		).toBe(false)
	})

	it('keeps errors that merely mention forbidden', () => {
		expect(
			isIgnoredSentryEvent(eventWith('AxiosError', 'Request failed: Forbidden'))
		).toBe(false)
	})

	it('keeps a third-party frame that is not the top one', () => {
		const event = eventWith('TypeError', 'boom', 'app:///_next/static/chunks/a.js')
		event.exception!.values![0].stacktrace!.frames!.unshift({
			filename: 'app:///gsi/client',
		})
		expect(isIgnoredSentryEvent(event)).toBe(false)
	})
})

describe('sentryBeforeSend', () => {
	it('drops ignored events and passes the rest', () => {
		const ignored = eventWith('Error', 'Forbidden')
		const kept = eventWith('TypeError', 'boom')
		expect(sentryBeforeSend(ignored, {})).toBeNull()
		expect(sentryBeforeSend(kept, {})).toBe(kept)
	})
})
