import { IconButton, Tooltip } from '@/common/ui'
import { AutoMode, FiberManualRecord, Numbers } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useApi } from '../../../../../../api/tech-and-hooks/useApi'
import { Card } from '../../../../../../common/ui/Card/Card'

export default function CurrentSongCount() {
	const t = useTranslations('admin')
	const { songGettingApi } = useApi()
	const [songCount, setSongCount] = useState<number>()

	const [autoRefresh, setAutoRefresh] = useState<boolean>(false)

	const getCount = async (ignore: boolean = false) => {
		if (ignore || autoRefresh) {
			songGettingApi
				.getSongsCount()
				.then((r) => {
					setSongCount(r)
				})
				.catch((e) => {
					console.log(e)
				})
		}
	}

	useEffect(() => {
		getCount(true)
		const interval = setInterval(getCount, 1000)

		return () => {
			clearInterval(interval)
		}
	}, [autoRefresh])
	return (
		<Card
			title={t('songCount.title')}
			subtitle={songCount?.toString() ?? t('songCount.loading')}
			icon={
				<>
					<Numbers />
					<IconButton
						sx={{
							position: 'absolute',
							top: 15,
							right: 15,
						}}
						onClick={() => setAutoRefresh((a) => !a)}
					>
						{autoRefresh ? (
							<Tooltip title={t('songCount.autoRefreshEnabled')}>
								<AutoMode color="primary" />
							</Tooltip>
						) : (
							<FiberManualRecord />
						)}
					</IconButton>
				</>
			}
			sx={{
				position: 'relative',
			}}
		></Card>
	)
}
