import { Box } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import React from 'react'

type PanelProps = {
	children: React.ReactNode
} & React.ComponentProps<typeof Box>

const Container = styled(Box)(({ theme }) => ({
	// the editor's top bar and sidebar: white surfaces edged by a hairline
	backgroundColor: theme.palette.surface.card,
	padding: theme.spacing(2),
	borderColor: theme.palette.surface.border,
	borderRight: `1px solid ${theme.palette.surface.border}`,
	borderBottom: `1px solid ${theme.palette.surface.border}`,
}))

export default function Panel(props: PanelProps) {
	return <Container {...props}>{props.children}</Container>
}
