'use client'

const getUserAgent = () =>
	typeof navigator !== 'undefined' ? navigator.userAgent : ''

export const isMobile =
	typeof navigator !== 'undefined' &&
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		getUserAgent()
	)

export const isTablet =
	typeof navigator !== 'undefined' &&
	/iPad|Android(?!.*Mobile)/i.test(getUserAgent())
