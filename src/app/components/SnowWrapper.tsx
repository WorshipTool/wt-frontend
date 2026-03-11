'use client'
import { useDownSize } from '@/common/hooks/useDownSize'
import dynamic from 'next/dynamic'

const Snow = dynamic(() => import('@/common/components/Snow'), { ssr: false })

export default function SnowWrapper() {
	const isMobile = useDownSize('md')

	if (isMobile) {
		return null
	}

	return <Snow />
}
