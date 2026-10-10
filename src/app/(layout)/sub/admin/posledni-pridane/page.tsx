import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { mapBasicVariantPackApiToDto } from '@/api/dtos'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import AdminBreadItem from '@/app/(layout)/sub/admin/components/AdminBreadItem'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, Clickable, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'

export default SmartPage(Page, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

async function Page() {
	const { songGettingApi } = await useServerApi()
	const data = await songGettingApi.getLastAdded()
	const packs = data.map((p) => mapBasicVariantPackApiToDto(p))
	return (
		<>
			<AdminBreadItem
				label={'Poslední přidané'}
				to={'adminLastAdded'}
				toParams={{}}
			/>
			<Box display={'flex'} flexDirection={'column'} gap={1}>
				{packs.map((pack, index) => (
					<Clickable key={pack.packGuid}>
						<Link to="variant" params={parseVariantAlias(pack.packAlias)}>
							<Box
								key={pack.packGuid}
								sx={{
									...SURFACE_CARD_SX,
									display: 'flex',
									gap: 2,
									padding: 2,
								}}
							>
								<Typography strong>{index + 1}</Typography>
								<Typography>{pack.title}</Typography>
							</Box>
						</Link>
					</Clickable>
				))}
			</Box>
		</>
	)
}
