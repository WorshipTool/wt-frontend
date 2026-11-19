'use server'
import { getRouteUrlWithParams } from '@/routes/tech/transformer.tech'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { Sheet } from '@pepavlin/sheet-api'
import { isApiNotFoundError } from '@/tech/fetch/isApiNotFoundError'
import { notFound } from 'next/navigation'
import { LayoutProps } from '../../../../../common/types'
import { getVariantAliasFromParams, getVariantByAlias } from './tech'

export const generateMetadata = generateSmartMetadata(
	'variant',
	async ({ params }) => {
		const alias = getVariantAliasFromParams(params.hex, params.alias)
		try {
			const variantData = await getVariantByAlias(alias)
			const variant = variantData.main
			const songTitle = variant.title

			const sheet = new Sheet(variant.sheetData)

			const title =
				songTitle + ` (${sheet.getKeyNote() ? 'Píseň s akordy' : 'Text písně'})`
			return {
				title: title,
				description: sheet.getText(),
				openGraph: {
					images: [getRouteUrlWithParams('variantPreviewImage', params)],
				},
			}
		} catch (e) {
			// Only a real 404 means the song doesn't exist; an unavailable backend
			// must not turn into 404 (search engines would drop the page).
			if (isApiNotFoundError(e)) notFound()
			throw e
		}
	}
)

export default async function layout(props: LayoutProps<'variant'>) {
	return <>{props.children}</>
}
