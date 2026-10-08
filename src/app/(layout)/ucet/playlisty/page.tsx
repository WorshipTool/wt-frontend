'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import CreateNewPlaylistButton from '@/app/(layout)/ucet/playlisty/components/CreateNewPlaylistButton'
import PlaylistItemRow from '@/app/(layout)/ucet/playlisty/components/PlaylistItemRow'
import PlaylistsOrderSelect, {
	PlaylistOrderOptions,
} from '@/app/(layout)/ucet/playlisty/components/PlaylistsOrderSelect'
import PlaylistyMobile from '@/app/(layout)/ucet/playlisty/PlaylistyMobile'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Pager from '@/common/components/Pager/Pager'
import { Box, LinearProgress } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { useUsersPlaylists } from '@/hooks/playlist/useUsersPlaylists'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { useMemo, useState } from 'react'

export default SmartPage(Playlists, ['middleWidth'])

function Playlists() {
	const { playlists: allPlaylists, loading } = useUsersPlaylists()
	const [sortType, setSortType] = useUrlState('sortKey', 'updatedAt')
	const phoneVersion = useIsPhone()

	const playlists = useMemo(() => {
		const arr =
			(sortType === 'updatedAt'
				? allPlaylists?.sort((a, b) => {
						return (
							new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
						)
				  })
				: sortType === 'createdAt'
				? allPlaylists?.sort((a, b) => {
						return (
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
						)
				  })
				: sortType === 'openedAt'
				? allPlaylists?.sort((a, b) => {
						if (a.openedAt === null && b.openedAt === null) {
							return a.title.localeCompare(b.title)
						}
						if (a.openedAt === null) {
							return 1
						}
						if (b.openedAt === null) {
							return -1
						}
						return (
							new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
						)
				  })
				: sortType === 'title'
				? allPlaylists?.sort((a, b) => {
						return a.title.localeCompare(b.title)
				  })
				: allPlaylists) || []

		return [...arr]
	}, [allPlaylists, sortType])

	const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistGuid | null>(
		null
	)

	if (phoneVersion) {
		return <PlaylistyMobile playlists={playlists} loading={loading} />
	}

	return (
		<Box>
			<Box sx={{ marginTop: 7 }} flex={1}>
				<Box
					display={'flex'}
					alignItems={'end'}
					justifyContent={'space-between'}
					gap={2}
				>
					<Typography variant="h4" strong>
						Moje playlisty
					</Typography>

					{!loading && (
						<Typography color={'grey.500'} thin>
							{playlists?.length} celkem
						</Typography>
					)}
					<PlaylistsOrderSelect
						onChange={setSortType}
						startValue={sortType as PlaylistOrderOptions}
					/>
					<Box flex={1} />
					<Box display={'flex'} gap={1}>
						<CreateNewPlaylistButton />
						{/* <PlaylistsMoreButton /> */}
					</Box>
				</Box>
				<Gap value={3} />
				{loading ? (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							// justifyContent: 'center',
							// alignItems: 'center',
							flex: 1,
							color: 'black',
						}}
					>
						<Box display={'flex'} justifyContent={'center'}>
							<Typography>Načítání playlistů...</Typography>
						</Box>
						<Gap />
						<LinearProgress />
					</Box>
				) : (
					<Box display={'flex'} flexDirection={'column'} gap={1}>
						{!playlists || playlists.length == 0 ? (
							<Box
								display={'flex'}
								flexDirection={'column'}
								alignItems={'center'}
							>
								<Typography italic>
									Nemáš žádný vytvořený playlist... Pro vytvoření klikni na
									modré tlačítko
								</Typography>
							</Box>
						) : (
							<>
								<Pager data={playlists || []}>
									{(playlists) => {
										return (
											<Box display={'flex'} flexDirection={'column'} gap={1}>
												{playlists.map((p) => {
													return (
														<PlaylistItemRow
															data={p}
															key={p.guid}
															onSelect={() => {
																setSelectedPlaylist(p.guid as PlaylistGuid)
															}}
															sortKey={sortType as PlaylistOrderOptions}
															selected={p.guid === selectedPlaylist}
														/>
													)
												})}
											</Box>
										)
									}}
								</Pager>
							</>
						)}
					</Box>
				)}
			</Box>
		</Box>
	)
}
