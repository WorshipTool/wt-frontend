import {
	CardActions,
	Card as CardContainer,
	CardContent,
	CardHeader,
	Divider,
} from '@mui/material'
import React from 'react'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'

type CardProps = {
	children?: React.ReactNode
	title?: string
	subtitle?: string
	icon?: React.ReactNode
	actions?: React.ReactNode
} & React.ComponentProps<typeof CardContainer>

export function Card(props: CardProps) {
	return (
		<CardContainer
			elevation={0}
			{...props}
			sx={[
				SURFACE_CARD_SX,
				...(Array.isArray(props.sx) ? props.sx : [props.sx]),
			]}
		>
			{(props.title || props.subtitle) && (
				<CardHeader
					title={props.title}
					subheader={props.subtitle}
					avatar={props.icon}
				/>
			)}
			{props.children && (
				<CardContent
					sx={{
						marginTop: props.title || props.subtitle ? -2 : undefined,
					}}
				>
					{props.children}
				</CardContent>
			)}

			{props.actions && (
				<>
					<Divider />
					<CardActions>{props.actions}</CardActions>
				</>
			)}
		</CardContainer>
	)
}
