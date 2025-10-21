import { getConfigSync } from '@/common/config/getConfig'

export const MAIL = {
	MAIN: getConfigSync().contact.main,
} as const
