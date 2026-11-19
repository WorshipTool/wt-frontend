import { InnerPackProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import {
	getVariantAliasFromParams,
	getVariantByAlias,
} from '@/app/(layout)/pisen/[hex]/[alias]/tech'
import { LayoutProps, MetadataProps } from '@/common/types'
import { isApiNotFoundError } from '@/tech/fetch/isApiNotFoundError'
import { notFound } from 'next/navigation'
import { generateSmartMetadata } from '../../../../../../../../../../tech/metadata/metadata'

export const generateMetadata = generateSmartMetadata(
	'teamSong',
	async ({ params }: MetadataProps<'teamSong'>) => {
		const alias = getVariantAliasFromParams(params.hex, params['title-alias'])
		try {
			const variantData = await getVariantByAlias(alias)
			const variant = variantData.main
			const songTitle = variant.title

			const title = songTitle
			// songTitle + ` (${sheet.getKeyChord() ? 'Píseň s akordy' : 'Text písně'})`
			return {
				title: title,
			}
		} catch (e) {
			if (isApiNotFoundError(e)) notFound()
			throw e
		}
	}
)

export default function TeamPisenLayout(props: LayoutProps<'teamSong'>) {
	return (
		<InnerPackProvider
			variantAlias={getVariantAliasFromParams(
				props.params.hex,
				props.params['title-alias']
			)}
		>
			{props.children}
		</InnerPackProvider>
	)
}
