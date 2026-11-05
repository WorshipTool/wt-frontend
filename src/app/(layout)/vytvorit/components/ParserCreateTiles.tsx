'use client'

import { useFilePicker } from '@/app/(layout)/nahrat/nacist/components/useFilePicker'
import { handOffImport } from '@/app/(layout)/nahrat/nacist/tech/importHandoff'
import { takeSearchKeyboard } from '@/app/(layout)/pisne/searchHandoff'
import CreateTile from '@/app/(layout)/vytvorit/components/CreateTile'
import { PARSER_CREATE_TILES } from '@/app/(layout)/vytvorit/components/createOptions'
import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box } from '@/common/ui'
import { useSmartNavigate } from '@/routes/useSmartNavigate'

/**
 * The three ways to add a song once the general parser is on. Phone: the file
 * tile full width, link and write side by side under it; desktop: three equal
 * tiles in a row. One grid, rearranged by a breakpoint.
 *
 * "Nahrát soubor" opens the system file picker from the tap itself (a picker
 * opened later is blocked) and only navigates once a file is picked — cancel
 * leaves you here. The file travels in memory (`handOffImport`), not the URL.
 */
export default function ParserCreateTiles() {
	const navigate = useSmartNavigate()

	const picker = useFilePicker((file) => {
		handOffImport({ kind: 'file', file })
		navigate('importSong', {})
	})

	const actions = {
		file: picker.open,
		link: () => {
			// take the keyboard while this still counts as a tap; the link field
			// takes it over when the import screen arrives
			takeSearchKeyboard()
			handOffImport({ kind: 'link' })
			navigate('importSong', {})
		},
		write: () => navigate('writeSong', { importovano: undefined }),
	}

	return (
		<Box
			sx={(theme) => ({
				width: '100%',
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: 1.5,
				[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
					width: 760,
					// the desktop column has no gutter of its own at narrow widths
					maxWidth: `calc(100% - ${theme.spacing(4)})`,
					gridTemplateColumns: 'repeat(3, 1fr)',
					gap: 2,
				},
			})}
		>
			{picker.input}
			{PARSER_CREATE_TILES.map((tile) => (
				<Box
					key={tile.action}
					sx={(theme) => ({
						gridColumn: tile.highlighted ? '1 / -1' : 'auto',
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
							gridColumn: 'auto',
						},
					})}
				>
					<CreateTile tile={tile} onClick={actions[tile.action]} />
				</Box>
			))}
		</Box>
	)
}
