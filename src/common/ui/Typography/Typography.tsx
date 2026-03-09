import { ColorType } from '@/common/ui/ui.types'
import { SxProps, Typography as Typo } from '@mui/material'
import { useMemo } from 'react'

type CustomTypographyProps = {
	children?: string | React.ReactNode
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'normal' | 'subtitle1'
	color?: ColorType
	size?: number | string
	align?: 'center' | 'inherit' | 'left' | 'right' | 'justify'
	sx?: SxProps
	className?: string
	noWrap?: boolean

	onClick?: (e: React.MouseEvent<HTMLElement>) => void

	strong?: boolean | number
	thin?: boolean
	uppercase?: boolean
	italic?: boolean
	small?: boolean
}

export function Typography({
	variant = 'normal',
	strong = false,
	color,
	size,
	...props
}: CustomTypographyProps) {
	const fontWeight = strong
		? strong === true
			? 700
			: strong
		: props.thin
		? 300
		: undefined

	size = props.small ? 'small' : size

	const typoVariant = variant === 'normal' ? 'body1' : variant

	const children = useMemo(() => {
		if (typeof props.children === 'string') {
			if (props.uppercase) {
				return props.children.toUpperCase()
			}
			return props.children
		}
		return props.children
	}, [props.children, props.uppercase])

	return (
		<Typo
			variant={typoVariant}
			color={color}
			fontWeight={fontWeight}
			sx={{
				fontSize: size,

				...props.sx,
			}}
			noWrap={props.noWrap}
			align={props.align}
			className={props.className}
			onClick={props.onClick}
		>
			{props.italic ? <i>{children}</i> : children}
		</Typo>
	)
}
