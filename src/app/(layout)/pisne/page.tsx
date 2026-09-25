'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import AllSongItem from '@/app/(layout)/pisne/AllSongItem'
import SongsMobile from '@/app/(layout)/pisne/SongsMobile'
import Pager from '@/common/components/Pager/Pager'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box, CircularProgress, Typography } from '@/common/ui'
import { Container } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { useApiStateEffect } from '@/tech/ApiState'
import { useApi } from '../../../api/tech-and-hooks/useApi'
import { Gap } from '../../../common/ui/Gap/Gap'
import { useSmartUrlState } from '../../../hooks/urlstate/useUrlState'
import { useTranslations } from 'next-intl'

export default SmartPage(List)
function List() {
	const t = useTranslations('songsList')
	const phoneVersion = useIsPhone()
	const [page, setPage] = useSmartUrlState('songsList', 's', {
		parse: (v) => parseInt(v),
		stringify: (v) => (v as number).toString(),
	})

	const { songGettingApi } = useApi()

	const [{ data: count }] = useApiStateEffect(async () =>
		songGettingApi.getListSongCount()
	)

	const isSmall = useDownSize('md')
	const isMiddle = useDownSize('lg')
	// One source of truth for the page size across every width, phones included —
	// the phone list used to carry its own constant while sharing the same `?s=`
	// URL key, so the two disagreed about which songs a given page number meant.
	const countPerPage = phoneVersion ? 12 : isSmall ? 8 : isMiddle ? 16 : 21
	const getPageData = async (page: number) => {
		const r = await songGettingApi.getList(page, countPerPage + 1)

		return r.slice(0, countPerPage)
	}

	if (phoneVersion) {
		return (
			<SongsMobile
				page={page ?? 1}
				onPageChange={setPage}
				count={count ?? 0}
				perPage={countPerPage}
			/>
		)
	}

	return (
		<Box>
			<Container
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 4,
				}}
			>
				<Gap value={3} />
				<Box display={'flex'}>
					<Typography variant="h4" strong>
						{t('title')}
					</Typography>
				</Box>
				<Pager
					data={getPageData}
					allCount={count || 0}
					take={countPerPage}
					startPage={page || 1}
					onPageChange={setPage}
				>
					{(data, loading, startIndex) => {
						return (
							<Box
								display={'flex'}
								flexDirection={'column'}
								gap={2}
								position={'relative'}
							>
								<Box
									sx={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										bgcolor: loading ? 'grey.300' : 'transparent',
										opacity: 0.5,
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										pointerEvents: loading ? undefined : 'none',
										transition: 'all 0.3s',
									}}
								>
									{loading && <CircularProgress />}
								</Box>

								<Grid container columns={3} spacing={1} paddingBottom={2}>
									{data.map((s, index) => {
										return (
											<Grid
												item
												xs={3}
												md={1.5}
												lg={1}
												key={s.main.songGuid as any}
											>
												<AllSongItem data={s} index={startIndex + index + 1} />
											</Grid>
										)
									})}
								</Grid>
							</Box>
						)
					}}
				</Pager>

				<Gap value={2} />
			</Container>
		</Box>
	)
}
