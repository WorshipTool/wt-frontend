'use server'
import { mapExtendedVariantPackApiToDto } from '@/api/dtos'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import SongPresentationContainer from '@/app/(layout)/pisen/[hex]/[alias]/prezentace/SongPresentationContainer'
import { getVariantAliasFromParams } from '@/app/(layout)/pisen/[hex]/[alias]/tech'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box } from '@/common/ui'
import { SmartParams, SmartSearchParams } from '@/routes'
import { Sheet } from '@pepavlin/sheet-api'

export default SmartPage(Page, ['fullWidth', 'hideFooter'])
async function Page({
	params,
	searchParams,
}: {
	params: SmartParams<'variantCards'>
	searchParams: SmartSearchParams<'variantCards'>
}) {
	const { songGettingApi } = await useServerApi()
	const aliasString = getVariantAliasFromParams(params.hex, params.alias)

	const data = await songGettingApi.getVariantDataByAlias(aliasString)
	const variant = mapExtendedVariantPackApiToDto(data.main)
	const sheet = new Sheet(variant.sheetData)
	if (searchParams.key) sheet.setKey(searchParams.key)
	variant.sheetData = sheet.toString()

	return (
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				zIndex: 10,
			}}
		>
			<SongPresentationContainer data={variant} />
		</Box>
	)
}
