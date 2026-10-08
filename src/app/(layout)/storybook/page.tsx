'use client'

import { Box, Button, Divider, Typography } from '@/common/ui'
import { useMemo } from 'react'
import StoryItem from './StoryItem'
import { storyBookComponents } from './createStory'

import { Masonry } from '@/common/ui/Masonry'
import {} from '@/ui/index.story'
// screen-level playgrounds live next to their screen rather than in the ui barrel
import {} from '@/app/components/HomeHeroConcept.story'
import {} from '@/common/components/MobileAppTabBar/MobileAppTabBar.story'
import { Gap } from '../../../common/ui/Gap'

export default function TestComponents() {
	const arr = useMemo(() => {
		return storyBookComponents.sort((a, b) => {
			return a.name?.localeCompare(b?.name)
		})
	}, [])
	return (
		<Box padding={3}>
			<Box
				display={'flex'}
				flexDirection={'row'}
				justifyContent={'space-between'}
				alignItems={'center'}
				gap={1}
			>
				<Typography strong={900}>Components: @/ui/*</Typography>
				<Button
					onClick={() => window?.location.reload()}
					size="small"
					variant="contained"
				>
					Znovu načíst
				</Button>
			</Box>
			<Gap />

			<Divider />
			<Gap />

			<Masonry>
				{arr.map((v) => {
					return <StoryItem item={v} key={v.name} />
				})}
			</Masonry>
		</Box>
	)
}
