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
					filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
					transition: 'transform 0.3s ease',
					'&:hover': {
						transform: 'rotate(-5deg) scale(1.05)',
					},
				}}
			>
				<Image
					src={getAssetUrl('/sheeps/ovce3.svg')}
					alt={t('sheep')}
					width={sheepSize}
					height={sheepSize}
					priority
				/>
			</Box>
			{showLastAdded ? (
				<LastAddedPanel mobileVersion={props.mobileVersion} />
			) : (
				<Box
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.85)',
						backdropFilter: 'blur(12px)',
						padding: 2.5,
						borderRadius: '16px',
						maxWidth: 300,
						boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
						border: '1px solid',
						borderColor: 'grey.200',
						transition: 'box-shadow 0.3s ease, transform 0.2s ease',
						'&:hover': {
							boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
							transform: 'translateY(-1px)',
						},
					}}
				>
					<Typography variant="h5" strong>
						{t('noIdea')}
					</Typography>
					<Typography color="grey.500" sx={{ marginTop: 0.5 }}>
						{t('chooseSuggestion')}
					</Typography>
				</Box>
			)}
			<AllListPanel />
		</Box>
	)
}
