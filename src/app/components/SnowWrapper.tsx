'use client'
import { useDownSize } from '@/common/hooks/useDownSize'
import dynamic from 'next/dynamic'

const Snow = dynamic(() => import('@/common/components/Snow'), { ssr: false })

// Seasonal effect — flip to true in winter to bring the snowfall back.
const SNOW_ENABLED = false

export default function SnowWrapper() {
	const isMobile = useDownSize('md')

	if (!SNOW_ENABLED || isMobile) {
		return null
	}

	return <Snow />
}
