'use client'

import { PlaylistData } from '@/api/generated'
import {
	MobileAppHeader,
	MobileHeaderPill,
} from '@/common/components/MobileAppHeader'
import { Box, Typography } from '@/common/ui'
import { GROUP_CARD_SX } from '@/common/ui/GroupList'
import { Link } from '@/common/ui/Link/Link'
import { Chip } from '@/common/ui/mui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import useCurrentPlaylist from '@/hooks/playlist/useCurrentPlaylist'
import usePlaylistsGeneral from '@/hooks/playlist/usePlaylistsGeneral'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import {
	AddRounded,
	ChevronRightRounded,
	QueueMusicRounded,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

const DIVIDER_INSET = 1.75

type PlaylistyMobileProps = {
	playlists: PlaylistData[]
	loading: boolean
}

/**
 * Native-feeling mobile list of the user's playlists inside the shared
 * collapsing MobileAppHeader (large title → slim sticky bar, back arrow to
 * Účet). White cards on the grey canvas with song count and last-updated date.
 * The desktop table-ish rows stay in page.tsx; this component owns the phone view.
 */
export default function PlaylistyMobile({
	playlists,
	loading,
}: PlaylistyMobileProps) {
	const tNav = useTranslations('navigation.toolsMenu')
	const t = useTranslations('account.playlists')
	const tPlaylist = useTranslations('playlist')

	const { turnOn } = useCurrentPlaylist()
	const { createPlaylist: createWithoutName } = usePlaylistsGeneral()
	const navigate = useSmartNavigate()
	const { fetchApiState, apiState } = useApiState<PlaylistGuid>()

	const createPlaylist = () => {
		fetchApiState(
			async () => await createWithoutName(),
			(result) => {
				navigate('playlist', { guid: result })
				turnOn(result)
			}
		)
	}

	const row = (p: PlaylistData, isLast: boolean) => (
		<Fragment key={p.guid}>
			<Link to="playlist" params={{ guid: p.guid }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						paddingX: 1.75,
						paddingY: 1.25,
						transition: 'background-color 0.15s ease',
						'&:active': { bgcolor: 'grey.100' },
					}}
				>
					<Box
						sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
					>
						<Typography strong noWrap>
							{p.title || t('untitled')}
						</Typography>
						<Typography small color="grey.600" noWrap>
							{tPlaylist('songsCount', { count: p.itemsCount })}
							{' · '}
							{getSmartDateAgoString(new Date(p.updatedAt))}
						</Typography>
					</Box>

					{p.teamName ? (
						<Chip label={p.teamName} size="small" color="primary" />
					) : null}

					<ChevronRightRounded sx={{ color: 'grey.400', flexShrink: 0 }} />
				</Box>
			</Link>
			{!isLast && (
				<Box
					sx={{ height: '1px', bgcolor: 'grey.200', marginLeft: DIVIDER_INSET }}
				/>
			)}
		</Fragment>
	)

	const subtitle =
		!loading && playlists.length > 0
			? t('playlistsCount', { count: playlists.length })
			: undefined

	return (
		<MobileAppHeader
			title={tNav('playlists')}
			subtitle={subtitle}
			backTo="account"
			actions={[
				<MobileHeaderPill
					key="new"
					onClick={createPlaylist}
					loading={apiState.loading}
					icon={<AddRounded />}
					alt={tPlaylist('createNewPlaylist')}
				>
					{tPlaylist('create')}
				</MobileHeaderPill>,
			]}
		>
			{loading ? (
				<Box sx={GROUP_CARD_SX}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Fragment key={i}>
							<Box sx={{ paddingX: 1.75, paddingY: 1.25 }}>
								<Skeleton
									variant="text"
									sx={{ width: '55%', bgcolor: 'grey.100' }}
								/>
								<Skeleton
									variant="text"
									sx={{ width: '80%', bgcolor: 'grey.100' }}
								/>
							</Box>
							{i < 5 && (
								<Box
									sx={{
										height: '1px',
										bgcolor: 'grey.200',
										marginLeft: DIVIDER_INSET,
									}}
								/>
							)}
						</Fragment>
					))}
				</Box>
			) : playlists.length === 0 ? (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
						gap: 1,
						paddingTop: 8,
						paddingX: 3,
					}}
				>
					<QueueMusicRounded sx={{ fontSize: 48, color: 'grey.400' }} />
					<Typography color="grey.600">{t('empty')}</Typography>
				</Box>
			) : (
				<Box sx={GROUP_CARD_SX}>
					{playlists.map((p, i) => row(p, i === playlists.length - 1))}
				</Box>
			)}
		</MobileAppHeader>
	)
}
