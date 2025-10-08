import { mapBasicVariantPackApiToDto } from '@/api/dtos'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useInnerPackSong } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import AdminOption from '@/common/components/admin/AdminOption'
import Popup from '@/common/components/Popup/Popup'
import SongListCard from '@/common/components/songLists/SongListCards/SongListCards'
import { Box } from '@/common/ui'
import { useApiStateEffect } from '@/tech/ApiState'
import { AltRoute } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ShowPackFamilyOption() {
	const t = useTranslations('song.admin')
	const [popupOpen, setPopupOpen] = useState(false)

	const { variant } = useInnerPackSong()
	const { packEmbeddingApi } = useApi()

	const [apiState] = useApiStateEffect(async () => {
		const packGuid = variant.packGuid
		const data = await packEmbeddingApi.findFamily(packGuid)

		return data
			.filter((v) => v.packGuid !== variant.packGuid)
			.map((v) => mapBasicVariantPackApiToDto(v))
	}, [variant, packEmbeddingApi])

	return (
		<>
			<AdminOption
				title={t('showTranslations')}
				icon={<AltRoute />}
				onClick={() => setPopupOpen(true)}
			/>

			<Popup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title={t('translationsList')}
				subtitle={t('otherVersions')}
				width={500}
			>
				<Box
					maxHeight={700}
					sx={{
						overflowY: 'auto',
						overflowX: 'hidden',
					}}
				>
					<SongListCard data={apiState.data || []} />
				</Box>
			</Popup>
		</>
	)
}
