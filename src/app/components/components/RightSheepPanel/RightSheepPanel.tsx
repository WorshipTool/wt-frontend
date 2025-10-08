'use client'
import AllListPanel from '@/app/components/components/AllListPanel/AllListPanel'
import LastAddedPanel from '@/app/components/components/LastAddedPanel/LastAddedPanel'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Box, Image, Typography } from '@/common/ui'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'

type Props = {
	mobileVersion: boolean
}

export default function RightSheepPanel(props: Props) {
	const sheepSize = 140
	const showLastAdded = useFlag('show_last_added_songs')
	const t = useTranslations('suggestions')
	return (
		<Box
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					top: '-110px',
					right: '10%',
					zIndex: -1,
				}}
			>
				<Image
					src={getAssetUrl('/sheeps/ovce3.svg')}
					alt={t('sheep')}
					width={sheepSize}
					height={sheepSize}
				/>
			</Box>
			{showLastAdded ? (
				<LastAddedPanel mobileVersion={props.mobileVersion} />
			) : (
				<Box
					sx={{
						bgcolor: 'grey.100',
						padding: 2,
						borderRadius: 2,
						maxWidth: 300,
					}}
				>
					<Typography variant="h5" strong>
						{t('noIdea')}
					</Typography>
					<Typography>
						{t('chooseSuggestion')}
					</Typography>
				</Box>
			)}
			<AllListPanel />
		</Box>
	)
}
