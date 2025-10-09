'use client'
import { SongDto } from '@/api/dtos'
import { useCloudConfig } from '@/common/providers/FeatureFlags/cloud-config/useCloudConfig'
import { Box, Button, Gap, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { styled } from '@/common/ui/mui'
import { grey } from '@/common/ui/mui/colors'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import { getStripeSupportUrl } from '@/common/utils/getStripeSupportUrl'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack, PackTranslationType } from '@/types/song'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const Container = styled(Box)(({ theme }) => ({
	backgroundColor: grey[200],
	borderStyle: 'solid',
	borderWidth: 1,
	borderColor: grey[300],
	borderRadius: theme.spacing(1),
	padding: theme.spacing(2),
	boxShadow: '0px 1px 2px 1px rgba(0, 0, 0, 0.05)',
}))

type Props = {
	song: SongDto
	pack: ExtendedVariantPack
}

export default function SongRightPanel(props: Props) {
	const showRightPanel = useCloudConfig('songPage', 'SHOW_RIGHT_PANEL', false)
	const showSupport = useCloudConfig(
		'songPage',
		'SHOW_FINANCIAL_SUPPORT_CARD',
		false
	)

	const tRight = useTranslations('songPage.rightPanel')
	const showAdditionalInfo = useCloudConfig(
		'songPage',
		'SHOW_ADDITIONAL_INFO_CARD',
		false
	)

	const original = props.song.variants.find(
		(v) => v.translationType === PackTranslationType.Original
	)
	const thisIsOriginal =
		props.pack.translationType === PackTranslationType.Original

	const moreVariants = props.song.variants.length - 1

	const [translationPopupOpen, setTranslationPopupOpen] = useState(false)

	return !showRightPanel ? null : (
		<Box
			sx={{
				width: '300px',
				gap: 2,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{showAdditionalInfo && (
				<Container>
					<Typography color="grey.800" variant="h6">
						{props.pack.title}
					</Typography>
					{thisIsOriginal ? (
						<>
							<Typography color="grey.600" small>
								{tRight('original')}
							</Typography>
						</>
					) : original ? (
						<>
							<Box display={'flex'} gap={0.5}>
								<Typography color="grey.600" small>
									{tRight('translationOf')}
								</Typography>
								<Link
									to="variant"
									params={parseVariantAlias(original.packAlias)}
								>
									<Typography small strong color="grey.800">
										{original.title}
									</Typography>
								</Link>
							</Box>
						</>
					) : null}
					<Gap value={2} />

					{moreVariants > 0 ? (
						<>
							<Button
								onClick={() => setTranslationPopupOpen(true)}
								small
								outlined
							>
								{tRight('chooseOther')}
							</Button>
							<TranslationsSelectPopup
								open={translationPopupOpen}
								onClose={() => setTranslationPopupOpen(false)}
								packs={props.song.variants}
							/>
						</>
					) : (
						<Typography>{tRight('noTranslations')}</Typography>
					)}
				</Container>
			)}
			{showSupport && (
				<Container
					sx={{
						bgcolor: 'grey.100',
						boxShadow: '0px 1px 10px 1px rgba(0, 0, 0, 0.1)',
						gap: 1,
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Typography variant="h6" align="center">
						{tRight('support.title')}
					</Typography>
					<Typography align="center">{tRight('support.intro')}</Typography>
					<Typography align="center">
						{tRight('support.description')}
					</Typography>
					<Gap />

					<Button color="success" outlined href={getStripeSupportUrl()}>
						{tRight('support.button')}
					</Button>
				</Container>
			)}
		</Box>
	)
}
