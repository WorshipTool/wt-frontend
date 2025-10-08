'use client'
import { Box, Typography } from '@/common/ui'
import { grey } from '@/common/ui/mui/colors'
import { getAssetUrl } from '@/tech/paths.tech'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function SheepBigGraphics() {
	const tAbout = useTranslations('about')
	return (
		<Box
			justifyContent={'center'}
			alignItems={'center'}
			padding={2}
			position={'relative'}
			minWidth={300}
			sx={{
				aspectRatio: '1',
			}}
		>
			<Box
				style={{
					zIndex: 1,
					// transform: 'scaleX(-1)',
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translateX(-50%) translateY(-50%) scaleX(-1)',
				}}
				sx={{
					width: 300,
					aspectRatio: '3/2',
					position: 'relative',
				}}
			>
				<Box
					sx={{
						width: 200,
						aspectRatio: '2/1',
						position: 'relative',
						zIndex: 1,
					}}
				>
					<Image
						src={'/assets/bubble.svg'}
						alt={tAbout('graphics.bubbleAlt')}
						fill
					/>
					<Typography
						sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%) scaleX(-1) ',
						}}
						align="center"
						variant="h6"
					>
						{tAbout('graphics.speech')}
					</Typography>
				</Box>
				<Box
					position={'relative'}
					sx={{
						width: 300,
						aspectRatio: '3/2',
						transform: 'translateY(-25%)',
					}}
				>
					<Image
						src={getAssetUrl('/sheeps/ovce2.svg')}
						alt={tAbout('graphics.sheepAlt')}
						fill
					/>
				</Box>
			</Box>
			<Box
				sx={{
					width: 400,
					height: 70,
					background: `radial-gradient(${grey[400]} 0%,${grey[400]} 10%, rgba(255,255,255,0) 40%)`,
					position: 'absolute',
					left: '50%',
					bottom: '50%',
					transform: 'translateX(-50%) translateY(50%) translateY(150%)',
				}}
			/>
		</Box>
	)
}
