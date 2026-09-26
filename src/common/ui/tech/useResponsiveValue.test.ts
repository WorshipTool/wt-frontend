import { pickResponsiveValue } from './useResponsiveValue'

describe('pickResponsiveValue', () => {
	it('returns a plain value at every breakpoint', () => {
		expect(pickResponsiveValue(3, 'xs')).toBe(3)
		expect(pickResponsiveValue(3, 'xl')).toBe(3)
	})

	it('takes the value given for this breakpoint', () => {
		expect(pickResponsiveValue({ xs: 1, md: 2, lg: 4 }, 'md')).toBe(2)
	})

	it('keeps the nearest value below in force where none is given', () => {
		// what broke the songs list: md had no value of its own, and the old
		// version fell back to the first key in the object (xs), so a three-column
		// list collapsed to one between 900 and 1200
		expect(pickResponsiveValue({ xs: 1, sm: 2, lg: 3 }, 'md')).toBe(2)
		expect(pickResponsiveValue({ xs: 1, md: 2, lg: 4, xl: 5 }, 'sm')).toBe(1)
	})

	it('falls back upwards when nothing is given at or below', () => {
		expect(pickResponsiveValue({ lg: 4 }, 'xs')).toBe(4)
	})

	it('reads an empty object as nothing', () => {
		expect(pickResponsiveValue({}, 'md')).toBeUndefined()
	})
})
