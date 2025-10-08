import { LayoutProps } from '@/common/types'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = generateSmartMetadata('contact', async () => {
	const t = await getTranslations('contact')
	return {
		title: t('title'),
	}
})

export default function ContactLayout({ children }: LayoutProps) {
	return children
}
