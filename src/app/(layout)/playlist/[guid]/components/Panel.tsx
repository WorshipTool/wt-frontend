import { Box } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import React from 'react'

type PanelProps = {
	children: React.ReactNode
} & React.ComponentProps<typeof Box>

const Container = styled(Box)(({ theme }) => ({
	// the editor's top bar and sidebar: a step lighter than the canvas but not
	// white, edged by a hairline — white is left to the cards (the song cards
	// in the middle, the song order in the sidebar), so the frame doesn't read
	// as one more card, nor melt into the page ground
	backgroundColor: theme.palette.surface.shell,
	padding: theme.spacing(2),
	borderColor: theme.palette.surface.border,
	borderRight: `1px solid ${theme.palette.surface.border}`,
	borderBottom: `1px solid ${theme.palette.surface.border}`,
}))

export default function Panel(props: PanelProps) {
	return <Container {...props}>{props.children}</Container>
}
