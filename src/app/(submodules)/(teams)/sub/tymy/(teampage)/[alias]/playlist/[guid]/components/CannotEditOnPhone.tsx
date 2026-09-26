'use client'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { PLAYLIST_WIDE_BREAKPOINT } from '@/app/(layout)/playlist/[guid]/playlist.constants'
import { Card, useTheme } from '@/common/ui'
import { useMediaQuery } from '@/common/ui/mui'
import { Info } from '@mui/icons-material'

/**
 * Shown where the three-panel editor has no left panel and no narrow layout has
 * taken its place — which, since the two now part at the same width, is only
 * the team playlist on a phone. The user's own playlist has a phone layout and
 * never renders this.
 */
export default function CannotEditOnPhone() {
	const theme = useTheme()
	const isMobile = useMediaQuery(
		theme.breakpoints.down(PLAYLIST_WIDE_BREAKPOINT)
	)

	const { canUserEdit } = useInnerPlaylist()
	const show = isMobile && canUserEdit

	return (
		show && (
			<Card
				icon={<Info />}
				subtitle="Playlist nelze na malém zařízení editovat. Pro editaci použij prosím
                        počítač."
				sx={{
					marginBottom: 2,
				}}
			></Card>
		)
	)
}
