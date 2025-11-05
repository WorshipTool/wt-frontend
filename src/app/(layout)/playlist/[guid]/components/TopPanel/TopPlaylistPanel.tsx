import Panel from '@/app/(layout)/playlist/[guid]/components/Panel'
import PlaylistMoreButton, {
	PLAYLIST_MORE_BUTTON_ID,
} from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/PlaylistMoreButton'
import PresentationButton from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/PresentationButton/PresentationButton'
import PrintButton from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/PrintButton/PrintButton'
import SaveEditButtons from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/SaveEditButtons/SaveEditButtons'
import ShareButton from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/ShareButton/ShareButton'
import TitleBox from '@/app/(layout)/playlist/[guid]/components/TopPanel/components/TitleBox/TitleBox'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { SmartPortalMenuProvider } from '@/common/components/SmartPortalMenuItem/SmartPortalMenuProvider'
import { Box, useTheme } from '@/common/ui'
export default function TopPlaylistPanel() {
	const { canUserEdit, guid } = useInnerPlaylist()
	const theme = useTheme()
	return (
		<SmartPortalMenuProvider id={PLAYLIST_MORE_BUTTON_ID}>
			<Panel
				sx={{
					minHeight: '2.4rem',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					position: 'sticky',
					top: 56,
					zIndex: 1,
					[theme.breakpoints.down('sm')]: {
						position: 'relative',
						top: 0,
					},
				}}
			>
				<TitleBox />
				<Box
					display={'flex'}
					flexDirection={'row'}
					alignItems={'center'}
					gap={1}
				>
					<PlaylistMoreButton />
					<PresentationButton
						to="playlistCards"
						toParams={{
							guid,
						}}
					/>
					<PrintButton />
					<ShareButton />
					{canUserEdit && (
						<Box
							display={{
								xs: 'none',
								sm: 'none',
								md: 'flex',
								lg: 'flex',
							}}
						>
							<Box />
							<SaveEditButtons />
						</Box>
					)}
				</Box>
			</Panel>
		</SmartPortalMenuProvider>
	)
}
