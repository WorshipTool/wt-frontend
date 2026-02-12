'use server'

import { HEADERS_PATHNAME_NAME } from '@/hooks/pathname/constants'
import { headers } from 'next/headers'

export const useServerPathname = async (): Promise<string> => {
	const h = await headers()
	return h.get(HEADERS_PATHNAME_NAME) || ''
}
