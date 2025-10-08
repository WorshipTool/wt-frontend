'use client'
import { Button } from '@/common/ui/Button'
import { useTranslations } from 'next-intl'

export default function MoreButton() {
	const tAbout = useTranslations('about')
	const onClick = () => {
		const toY = window.innerHeight - 56

		window.scrollTo({
			top: toY,
			behavior: 'smooth',
		})
	}
	return (
		<Button color="primarygradient" onClick={onClick}>
			{tAbout('more.button')}
		</Button>
	)
}
