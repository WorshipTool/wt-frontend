import { LayoutProps } from '@/common/types'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = generateSmartMetadata('importSong', async () => {
	const t = await getTranslations('upload')
	return {
		title: t('import.title'),
	}
})

export default function ImportSongLayout({ children }: LayoutProps) {
	return children
}
