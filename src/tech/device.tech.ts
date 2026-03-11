'use client'

const getUserAgent = () =>
	typeof navigator !== 'undefined' ? navigator.userAgent : ''

const getMaxTouchPoints = () =>
	typeof navigator !== 'undefined' ? navigator.maxTouchPoints ?? 0 : 0

const ua = getUserAgent()

// Modern iPads (iPadOS 13+) report as Macintosh but have multi-touch support.
// Real Macs have maxTouchPoints === 0.
const isModernIPad = /Macintosh/i.test(ua) && getMaxTouchPoints() > 1

export const isTablet =
	typeof navigator !== 'undefined' &&
	(/iPad/i.test(ua) || isModernIPad || /Android(?!.*Mobile)/i.test(ua))

export const isMobile =
	typeof navigator !== 'undefined' &&
	!isTablet &&
	/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
