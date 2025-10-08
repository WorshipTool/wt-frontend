import { Box } from '@/common/ui'
import { IconButton } from '@/common/ui/IconButton'
import { Link } from '@/common/ui/Link/Link'
import { ListItemIcon, ListItemText, MenuItem } from '@/common/ui/mui'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import { Launch } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import React, { MouseEvent } from 'react'

interface PlaylistMenuItemProps {
	guid: PlaylistGuid
	title: string
	disabled?: boolean
	icon?: React.ReactNode

	hideLink?: boolean

	onClick?: (e: React.MouseEvent) => void
}

export default function PlaylistMenuItem({
	guid: playlistGuid,
	title,
	...props
}: PlaylistMenuItemProps) {
	const t = useTranslations('playlist')
	
	const openPlaylist = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	const onClick = (e: MouseEvent) => {
		props.onClick?.(e)
	}

	return (
		<MenuItem
			key={playlistGuid + 'pl'}
			disabled={props.disabled}
			onClick={onClick}
		>
			<Box display={'flex'} flexDirection={'row'} gap={0.5}>
				<Box
					sx={{
						flexDirection: 'row',
						display: 'flex',
					}}
				>
					{props.icon && <ListItemIcon>{props.icon}</ListItemIcon>}

					<ListItemText primary={title} />
				</Box>

				{!props.hideLink && (
					<Box onClick={openPlaylist}>
						<Link
							to="playlist"
							params={{
								guid: playlistGuid,
							}}
							newTab
						>
							<IconButton
								// onClick={openPlaylist}
								tooltip={t('openInNewTab')}
								size="small"
								sx={{
									marginY: '-5px',
									marginX: '-4px',
									transform: 'scale(0.8)',
								}}
							>
								<Launch fontSize="small" />
							</IconButton>
						</Link>
					</Box>
				)}
			</Box>
		</MenuItem>
	)
}
