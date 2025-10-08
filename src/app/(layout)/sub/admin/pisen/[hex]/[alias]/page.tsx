'use server'
import { mapExtendedVariantPackApiToDto } from '@/api/dtos'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import AdminSectionCollapsible from '@/app/(layout)/sub/admin/components/AdminSectionCollapsible'
import AdminCopySheetDataButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AdminCopySheetDataButton'
import AdminItem from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AdminItem'
import AdminMediaSection from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AdminMediaSection'
import AdminSongPreview from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AdminSongPreview'
import AdminVerifyButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AdminVerifyButton'
import GGFilterAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/GGFilterAdminButton'
import ParentSongSection from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/ParentSongSection'
import PublishAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/PublishAdminButton'
import SetTranslationTypeAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/SetTranslationTypeAdminButton'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { PageProps } from '@/common/types'
import { Box, Button, Chip, Gap, Typography } from '@/common/ui'
import { getTranslationData } from '@/common/ui/SongCard/components/tech'
import { makeVariantAlias } from '@/tech/song/variant/variant.utils'
import { SongLanguage } from '@/types/song'
import { OpenInNew } from '@mui/icons-material'
import { getTranslations } from 'next-intl/server'

export default SmartPage(Page, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

async function Page(pageProps: PageProps<'adminPack'>) {
	const { songGettingApi } = await useServerApi()
	const t = await getTranslations('admin')

	const alias = makeVariantAlias(pageProps.params.hex, pageProps.params.alias)
	const data = await songGettingApi.getVariantDataByAlias(alias)
	const main = mapExtendedVariantPackApiToDto(data.main)

	const translationData = getTranslationData(
		main.translationType,
		main.language as SongLanguage
	)

	return (
		<Box display={'flex'} gap={2} flexDirection={'column'}>
			<Box display={'flex'} flexDirection={'row'} gap={2}>
				<AdminSongPreview
					sx={{
						width: 150,
						height: 150,
					}}
				/>

				<Box display={'flex'} flexDirection={'column'} gap={2} padding={2}>
					<Box display={'flex'} gap={2} alignItems={'center'}>
						<Typography variant="h5" strong>
							{main.title}
						</Typography>

						<Chip
							label={'568'}
							color="success"
							// size="small"
							sx={{
								fontSize: '1rem',
								fontWeight: '700',
							}}
						/>
					</Box>

					{translationData.message && (
						<Typography>{translationData.message}</Typography>
					)}

					{main.createdByLoader && <Typography>{t('songInfo.uploadedByProgram')}</Typography>}

					<ParentSongSection />
				</Box>
			</Box>

			<Box display={'flex'} flexDirection={'row'} gap={2}>
				<SetTranslationTypeAdminButton />
				<GGFilterAdminButton />
				<AdminVerifyButton />
				<AdminCopySheetDataButton />
				<PublishAdminButton />
			</Box>

			<AdminSectionCollapsible title={t('songInfo.extendedInfo')}>
				<AdminItem title={t('songInfo.language')}>{main.language as SongLanguage}</AdminItem>
				<AdminItem title={t('songInfo.ggFilterCompliant')}>
					{main.ggValidated ? t('songInfo.yes') : t('songInfo.no')}
				</AdminItem>
				<AdminItem title={t('songInfo.public')} value={main.public ? t('songInfo.yes') : t('songInfo.no')} />
				<Gap />

				<AdminItem title="PackGuid" value={main.packGuid} />
				<AdminItem title="PackAlias" value={main.packAlias} />
				<AdminItem title="SongGuid" value={main.songGuid} />
			</AdminSectionCollapsible>

			<AdminMediaSection data={data} />

			<Box
				sx={{
					position: 'fixed',
					bottom: 0,
					right: 0,
					padding: 4,
				}}
			>
				<Button
					to="variant"
					toParams={{
						hex: pageProps.params.hex,
						alias: pageProps.params.alias,
					}}
					startIcon={<OpenInNew fontSize="small" />}
					sx={{
						width: 'fit-content',
					}}
					// small
				>
					{t('goToSong')}
				</Button>
			</Box>
		</Box>
	)
}
