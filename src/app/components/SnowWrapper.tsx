'use client'
import Snow from '@/common/components/Snow'
import { useDownSize } from '@/common/hooks/useDownSize'

export default function SnowWrapper() {
	const isMobile = useDownSize('md')

	if (isMobile) {
		return null
	}

	return <Snow />
}
