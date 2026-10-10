'use client'
import { SongDto } from '@/api/dtos'
import { useCloudConfig } from '@/common/providers/FeatureFlags/cloud-config/useCloudConfig'
import { Box, Button, Gap, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { styled } from '@/common/ui/mui'
import { SURFACE_SHADOW } from '@/common/constants/surfaces'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import { getStripeSupportUrl } from '@/common/utils/getStripeSupportUrl'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack, PackTranslationType } from '@/types/song'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const Container = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.surface.card,
	borderStyle: 'solid',
	borderWidth: 1,
	borderColor: theme.palette.surface.border,
	borderRadius: theme.shape.borderRadius * 3,
	padding: theme.spacing(2),
	boxShadow: SURFACE_SHADOW.card,
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
