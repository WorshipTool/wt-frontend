import { InnerPackProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import {
	getVariantAliasFromParams,
	getVariantByAlias,
} from '@/app/(layout)/pisen/[hex]/[alias]/tech'
import { LayoutProps, MetadataProps } from '@/common/types'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { isApiNotFoundError } from '@/tech/fetch/isApiNotFoundError'
import { notFound } from 'next/navigation'

export const generateMetadata = generateSmartMetadata(
	'teamPublicSong',
	async ({ params }: MetadataProps<'teamPublicSong'>) => {
		const alias = getVariantAliasFromParams(params.hex, params['title-alias'])
		try {
			const variantData = await getVariantByAlias(alias)
			const variant = variantData.main
			const songTitle = variant.title

			const title = songTitle
			return {
				title: title,
			}
		} catch (e) {
			if (isApiNotFoundError(e)) notFound()
			throw e
		}
	}
)

export default function TeamPisenLayout(props: LayoutProps<'teamPublicSong'>) {
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
