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
	const sheepSize = 155
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
					top: '-120px',
					right: '8%',
					zIndex: -1,
					filter: 'drop-shadow(0 6px 20px rgba(0, 133, 255, 0.12))',
					transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
					'&:hover': {
						transform: 'rotate(-8deg) scale(1.1) translateY(-4px)',
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
						bgcolor: 'rgba(255, 255, 255, 0.92)',
						backdropFilter: 'blur(16px)',
						padding: 2.5,
						borderRadius: '18px',
						maxWidth: 300,
						boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
						border: '1px solid',
						borderColor: 'rgba(0, 133, 255, 0.08)',
						transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
						'&:hover': {
							boxShadow: '0 8px 32px rgba(0, 133, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
							transform: 'translateY(-3px)',
							borderColor: 'rgba(0, 133, 255, 0.15)',
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
