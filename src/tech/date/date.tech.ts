import { czechConjugation } from '@/tech/string/string.tech'

export const isDateTodayOrInFuture = (date: Date, now?: Date): boolean => {
	now = now || new Date()
	date.setHours(0, 0, 0, 0)
	now.setHours(0, 0, 0, 0)
	return date >= now
}

export const isDateToday = (date: Date, now?: Date): boolean => {
	now = now || new Date()
	date.setHours(0, 0, 0, 0)
	now.setHours(0, 0, 0, 0)
	return date.getTime() === now.getTime()
}

export const isDateTomorrow = (date: Date, now?: Date): boolean => {
	now = now || new Date()
	now.setDate(now.getDate() + 1)
	return isDateToday(date, now)
}

export const getSmartDateAgoString = (
	date: Date,
	prefix?: string,
	maxLength?: number
): string => {
	// If less than 5 minutes, 'Před chvílí'
	// If less than 1 hour, 'Před x minutami'
	// If less than 1 day, 'Před x hodinami'
	// If less than 2 days, 'Včera'
	// If less than 7 days, 'x days ago'
	// Else 'date'

	prefix = prefix || ''
	const withPrefix = (withoutPrefix: string) => {
		if (prefix) {
			const withPrefix = prefix + ' ' + withoutPrefix

			if (!maxLength || withPrefix.length <= maxLength) return withPrefix
		}

		// Return with capital letter
		return withoutPrefix.charAt(0).toUpperCase() + withoutPrefix.slice(1)
	}

	const now = new Date()
	const diff = now.getTime() - date.getTime()

	if (diff < 1000 * 60 * 5) {
		return withPrefix('před chvílí')
	}
	if (diff < 1000 * 60 * 60) {
		return withPrefix(`Před ${Math.floor(diff / (1000 * 60))} minutami`)
	}

	if (diff < 1000 * 60 * 60 * 24) {
		const count = Math.floor(diff / (1000 * 60 * 60))
		return withPrefix(
			`před ${count} ${czechConjugation(
				'hodinou',
				'hodinami',
				'hodinami',
				count
			)}`
		)
	}

	if (diff < 1000 * 60 * 60 * 24 * 2) {
		return withPrefix(prefix + 'včera')
	}

	if (diff < 1000 * 60 * 60 * 24 * 7) {
		const count = Math.floor(diff / (1000 * 60 * 60 * 24))
		return withPrefix(
			`Před ${count} ${czechConjugation('dnem', 'dny', 'dny', count)}`
		)
	}

	return withPrefix(`${date.toLocaleDateString()}`)
}
