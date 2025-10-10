import { useMemo } from 'react'

export const useUniqueHookId = () => {
	const uniqueHookId = useMemo(
		() => Math.random().toString(36).substr(2, 9),
		[]
	)
	return uniqueHookId
}
