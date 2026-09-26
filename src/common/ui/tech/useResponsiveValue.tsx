import { ResponsiveStyleValue, useMediaQuery, useTheme } from '@mui/system'

/** Smallest to largest, the order a responsive value is read in. */
export const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export type BreakpointKey = (typeof BREAKPOINT_ORDER)[number]

/**
 * The value that applies at `breakpoint`, following the usual rule: a value is
 * in force from the breakpoint it is given for upwards, until another one
 * replaces it. A caller that gives `{ xs: 1, sm: 2, lg: 3 }` means two columns
 * at md as well — it said nothing about md because sm's answer still holds.
 *
 * Below the smallest given value, that smallest one applies, so there is always
 * an answer.
 *
 * Pure, so it can be tested without a DOM; the hook below supplies the current
 * breakpoint.
 */
export function pickResponsiveValue<T>(
	responsiveValue: ResponsiveStyleValue<T>,
	breakpoint: BreakpointKey
): T {
	if (typeof responsiveValue !== 'object' || responsiveValue === null)
		return responsiveValue as T

	const values = responsiveValue as Partial<Record<BreakpointKey, T>>
	const index = BREAKPOINT_ORDER.indexOf(breakpoint)

	// this breakpoint, then downwards: the nearest value still in force
	for (let i = index; i >= 0; i--) {
		const value = values[BREAKPOINT_ORDER[i]]
		if (value !== undefined) return value
	}

	// nothing at or below: the smallest one given is what the caller has
	for (let i = index + 1; i < BREAKPOINT_ORDER.length; i++) {
		const value = values[BREAKPOINT_ORDER[i]]
		if (value !== undefined) return value
	}

	return undefined as T
}

export function useResponsiveValue<T>(
	responsiveValue: ResponsiveStyleValue<T>
): T {
	const theme = useTheme()

	// one query per breakpoint, in a fixed order — hooks cannot be called in a loop
	const matches: Record<BreakpointKey, boolean> = {
		xs: useMediaQuery(theme.breakpoints.only('xs')),
		sm: useMediaQuery(theme.breakpoints.only('sm')),
		md: useMediaQuery(theme.breakpoints.only('md')),
		lg: useMediaQuery(theme.breakpoints.only('lg')),
		xl: useMediaQuery(theme.breakpoints.only('xl')),
	}

	const current =
		BREAKPOINT_ORDER.find((breakpoint) => matches[breakpoint]) ?? 'xs'

	return pickResponsiveValue(responsiveValue, current)
}
