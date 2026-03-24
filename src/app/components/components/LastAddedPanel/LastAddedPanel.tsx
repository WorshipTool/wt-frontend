'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import RowSongPackCard from '@/common/components/song/RowSongPackCard'
import { Box, Typography, useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type Props = {
	mobileVersion: boolean
}

export default function LastAddedPanel(props: Props) {
	const theme = useTheme()
	const { data, isLoading, isError, isSuccess } = useLastAddedSongs()
	const tHome = useTranslations('home')

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	const isTiny = useMediaQuery('(max-height:550px)')
	const isShort = useMediaQuery('(min-height:551px) and (max-height:650px)')
	const isMedium = useMediaQuery('(min-height:651px) and (max-height:800px)')

	// Determine how many suggestions to show based on viewport size
	const ideasCount = props.mobileVersion
		? 4
		: isTiny
		? 1
		: isShort
		? 2
		: isMedium
		? 3
		: 4

	return (
		<Box position={'relative'}>
			<Box
				sx={{
					bgcolor: 'rgba(255, 255, 255, 0.92)',
					backdropFilter: 'blur(16px)',
					borderRadius: '18px',
					padding: 2.5,
					boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
					border: '1px solid',
					borderColor: 'rgba(0, 133, 255, 0.08)',
					display: 'flex',
					flexDirection: 'column',
					gap: 1.5,
					transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
					'&:hover': {
						boxShadow: '0 8px 32px rgba(0, 133, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
						transform: 'translateY(-3px)',
						borderColor: 'rgba(0, 133, 255, 0.15)',
					},
				}}
			>
				<Typography variant="h5" strong>
					{tHome('lastAdded.title')}
				</Typography>

				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 1,
						width: 250,
					}}
				>
					{isLoading || !init ? (
						<>
							{Array.from({ length: ideasCount }).map((_, i) => (
								<Skeleton
									key={i}
									variant="rounded"
									sx={{
										width: '100%',
										height: 42,
										borderRadius: '12px',
										bgcolor: theme.palette.grey[200],
									}}
								/>
							))}
						</>
					) : (
						data
							.slice(0, ideasCount)
							.map((s) => <RowSongPackCard key={s.packAlias} data={s} />)
					)}
				</Box>
			</Box>
		</Box>
	)
}
