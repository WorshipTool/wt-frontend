'use client'

import { createStory } from '@/app/(layout)/storybook/createStory'
import { Box } from '@/common/ui/Box'
import { SearchBar } from '@/common/ui/SearchBar'
import { Typography } from '@/common/ui/Typography'
import { ReactNode, useState } from 'react'

/**
 * The app's one search field, in every state it has.
 *
 * The fill follows the width rather than the caller: paper under 700px, grey
 * above it. Narrow the window and every bar here changes together — which is
 * the point, and the thing that cannot be seen in one screenshot.
 */
const WIDTH = 420

function Case({ label, children }: { label: string; children: ReactNode }) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
				width: WIDTH,
				maxWidth: '100%',
			}}
		>
			<Typography small strong uppercase color="grey.600">
				{label}
			</Typography>
			{children}
		</Box>
	)
}

const SearchBarStory = () => {
	const [typed, setTyped] = useState('ranní chvály')
	const [smart, setSmart] = useState(true)

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
				whiteSpace: 'normal',
			}}
		>
			<Case label="Prázdný">
				<SearchBar autoFocus={false} />
			</Case>

			<Case label="Vlastní placeholder">
				<SearchBar autoFocus={false} placeholder="Hledat písně" />
			</Case>

			<Case label="S textem a křížkem">
				<SearchBar
					autoFocus={false}
					value={typed}
					onChange={setTyped}
					onClear={() => setTyped('')}
				/>
			</Case>

			<Case label="S přepínačem chytrého hledání">
				<SearchBar
					autoFocus={false}
					value={typed}
					onChange={setTyped}
					onClear={() => setTyped('')}
					showSmartSearch
					useSmartSearch={smart}
					onSmartSearchChange={setSmart}
				/>
			</Case>

			<Case label="Zvýrazněný — gradient, jen domovský hero">
				<SearchBar autoFocus={false} highlighted />
			</Case>

			<Case label="Na bílé ploše (popup výběru písně)">
				<Box
					sx={{
						bgcolor: 'background.paper',
						borderRadius: 3,
						padding: 2,
						boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
					}}
				>
					<SearchBar autoFocus={false} placeholder="Hledat píseň" />
				</Box>
			</Case>
		</Box>
	)
}

// named by hand: the component is exported through a barrel the gallery cannot
// read a name from
createStory('SearchBar', SearchBarStory)
