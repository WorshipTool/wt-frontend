'use client'
import { Box, CircularProgress, Image, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { SxProps } from '@/common/ui/mui'

import { getRouteUrlWithParams } from '@/routes/tech/transformer.tech'
import { useSmartParams } from '@/routes/useSmartParams'
import { useState } from 'react'

type Props = {
	sx?: SxProps
}

export default function AdminSongPreview(props: Props) {
	const params = useSmartParams('adminPack')
	const image = getRouteUrlWithParams('variantPreviewImage', params)

	const [isLoaded, setIsLoaded] = useState(false)
	return (
		<Link to={'variant'} params={params}>
			<Box
				sx={{
					bgcolor: 'surface.card',
					borderRadius: 3,
					display: 'flex',
					position: 'relative',
					border: '1px solid',
					borderColor: 'grey.400',
					overflow: 'hidden',

					'&:hover #preview-placeholder': {
						opacity: 1,
					},
					'&:hover #preview-image': {
						transform: 'scale(1.5) translateX(15%) translateY(15%)',
					},
					...props.sx,
				}}
			>
				<Image
					id="preview-image"
					src={image}
					alt={'Náhled písně'}
					fill
					style={{
						objectFit: 'cover',
						objectPosition: ' 0 0',
						transition: 'transform 1s',
					}}
					onLoad={() => setIsLoaded(true)}
				/>

				{!isLoaded && (
					<Box
						sx={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
							top: 0,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							color: 'grey.600',
						}}
					>
						<CircularProgress color="inherit" />
					</Box>
				)}

				<Box
					id={'preview-placeholder'}
					sx={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						left: 0,
						top: 0,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'end',
						bgcolor: 'rgba(0,0,0,0.01)',
						opacity: 0,
						color: 'white',
						transition: 'opacity 0.5s',
						border: '1px solid',
						borderColor: 'grey.400',
						borderRadius: 3,
						overflow: 'hidden',
						userSelect: 'none',
						cursor: 'pointer',
					}}
				>
					<Box
						sx={{
							bgcolor: 'grey.800',
							// borderRadius: '0 0 12px 12px',
							padding: 0.5,
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<Typography small>Otevřít</Typography>
					</Box>
				</Box>
			</Box>
		</Link>
	)
}
