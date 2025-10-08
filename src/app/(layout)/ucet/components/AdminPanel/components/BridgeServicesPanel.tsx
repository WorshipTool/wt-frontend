import { useApi } from '@/api/tech-and-hooks/useApi'
import {
	Box,
	Button,
	Card,
	Clickable,
	Gap,
	IconButton,
	Tooltip,
	Typography,
} from '@/common/ui'
import { Chip } from '@/common/ui/mui'
import { useApiStateEffect } from '@/tech/ApiState'
import { Lan, LastPage, Refresh } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type BridgeServiceData = {
	id: string
	type: string
	name: string
	lastTickDate: any
	active: boolean
	external: boolean
}
export default function BridgeServicesPanel() {
	const t = useTranslations('admin')
	const { bridgeApi } = useApi()
	const [apiState, refresh] = useApiStateEffect<BridgeServiceData[]>(
		async () => {
			return bridgeApi.getServices() as any
		}
	)

	const [showAll, setShowAll] = useState(false)

	const allData =
		(apiState.data &&
			Array.isArray(apiState.data) &&
			apiState.data.sort((a, b) => {
				if (a.active && !b.active) return -1
				if (!a.active && b.active) return 1
				return a.name.localeCompare(b.name)
			})) ||
		[]

	const filteredData = allData.filter((_, i) => {
		// show only with tickDate in last 6 hours
		if (showAll) return true
		const lastTickDate = new Date(_.lastTickDate)
		const ago = Date.now() - lastTickDate.getTime()
		return ago < 1000 * 60 * 60 * 6
	})

	return (
		<Card
			title={t('bridgeServices.title')}
			icon={<Lan />}
			sx={{ position: 'relative' }}
		>
			<Box
				sx={{
					position: 'absolute',
					right: 0,
					top: 0,
					padding: 1,
				}}
			>
				<IconButton size="small" disabled={apiState.loading} onClick={refresh}>
					<Refresh fontSize="small" />
				</IconButton>
			</Box>

			{filteredData.map((s) => {
				const lastTickDate = new Date(s.lastTickDate)
				const ago = Date.now() - lastTickDate.getTime()

				return (
					<Clickable key={s.id}>
						<Box
							key={s.id}
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: 1,
								justifyContent: 'space-between',
								bgcolor: 'grey.100',
								padding: 1,
								borderRadius: 1,
								opacity: s.active ? 1 : 0.6,
							}}
						>
							<Box display={'flex'} alignItems={'center'} gap={2}>
								<Box
									sx={{
										width: '1rem',
										height: '1rem',
										borderRadius: '50%',
										bgcolor: s.active ? 'success.main' : 'error.main',
									}}
								/>
								<Box display={'flex'} alignItems={'center'} gap={1}>
									<Typography strong>{s.name}</Typography>
									<Chip size="small" label={s.type} disabled />
								</Box>
							</Box>
							<Box display={'flex'} alignItems={'center'} gap={1}>
								<Typography small>{t('bridgeServices.timeAgo', { seconds: Math.floor(ago / 1000).toString() })}</Typography>
								{s.external && (
									<Tooltip title={t('bridgeServices.external')}>
										<LastPage fontSize="small" />
									</Tooltip>
								)}
							</Box>
						</Box>
					</Clickable>
				)
			})}

			{filteredData.length === 0 && (
				<Box display={'flex'} justifyContent={'center'}>
					<Typography italic size={'small'}>
						{t('bridgeServices.noConnectedPrograms')}
					</Typography>
				</Box>
			)}

			{!showAll && allData.length > filteredData.length && (
				<>
					<Gap />
					<Box display={'flex'} justifyContent={'center'}>
						<Button
							onClick={() => setShowAll(true)}
							variant="text"
							size="small"
						>
							{t('bridgeServices.showAll')}
						</Button>
					</Box>
				</>
			)}
		</Card>
	)
}
