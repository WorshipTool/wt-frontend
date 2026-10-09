import AddSongToPlaylistButton from '@/app/(layout)/playlist/[guid]/components/LeftPanel/AddSongToPlaylistButton'
import PlaylistMenuList from '@/app/(layout)/playlist/[guid]/components/LeftPanel/PlaylistMenuList'
import Panel from '@/app/(layout)/playlist/[guid]/components/Panel'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { PLAYLIST_WIDE_BREAKPOINT } from '@/app/(layout)/playlist/[guid]/playlist.constants'
import { Box, useTheme } from '@/common/ui'
import { SxProps } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { grey } from '@mui/material/colors'
import './LeftPanel.styles.css'

type LeftPanelProps = {
	sx?: SxProps
}

export default function LeftPanel(props: LeftPanelProps) {
	const { canUserEdit } = useInnerPlaylist()
	const theme = useTheme()

	return (
		<Box
			sx={{
				// see PLAYLIST_WIDE_BREAKPOINT: below this the narrow layout takes
				// over, and it carries these controls itself
				[theme.breakpoints.down(PLAYLIST_WIDE_BREAKPOINT)]: {
					display: 'none',
				},
			}}
		>
			<Box
				sx={{
					width: 335,
				}}
			/>
			<Panel
				sx={{
					width: 300,
					position: 'fixed',
					top: 127,
					bottom: 0,
					backgroundColor: grey[100],
					...props.sx,
				}}
			>
				{
					<Box
						display={'flex'}
						flexDirection={'row'}
						justifyContent={'space-between'}
					>
						<Typography strong={500}>Pořadí písní:</Typography>
						{canUserEdit && (
							<Typography strong={300} color={grey[600]}>
								Změňte přetažením
							</Typography>
						)}
					</Box>
				}
				<Box
					sx={{
						'&::-webkit-scrollbar': {
							display: 'auto',
						},
						position: 'relative',
						paddingBottom: 8,
						overflowY: 'auto',
						height: `calc(100vh - 160px - ${theme.spacing(2)})`,
					}}
					className={'song-menu-list'}
				>
					<PlaylistMenuList />
				</Box>

				<Box
					sx={{
						position: 'absolute',
						bottom: theme.spacing(3),
						right: theme.spacing(3),
					}}
				>
					<AddSongToPlaylistButton />
				</Box>
			</Panel>
		</Box>
	)
}
