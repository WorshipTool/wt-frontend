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

	// const navigate = useSmartNavigate()
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
					bgcolor: 'grey.100',
					borderRadius: 2,
					padding: 2,
					boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.2)',
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
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
										borderRadius: 2,
										bgcolor: theme.palette.grey[300],
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
