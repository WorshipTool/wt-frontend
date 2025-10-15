import { theme } from '@/common/constants/theme'
import { Typography } from '@/common/ui/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { Box, SxProps } from '@mui/material'
import { ComponentProps, forwardRef, memo, useCallback, useMemo } from 'react'
import { RoutesKeys } from '../../../routes'
import { Tooltip } from '../CustomTooltip/Tooltip'
import { CustomLink } from '../Link'
import { CommonLinkProps } from '../Link/Link'
import { ColorType, isColorOfThemeType } from '../ui.types'

export type ButtonProps<T extends RoutesKeys> = {
	children?: string | React.ReactNode
	variant?: 'contained' | 'outlined' | 'text'
	color?: ColorType | 'primarygradient'
	size?: 'small' | 'medium' | 'large'
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
	tooltip?: string
	tooltipPlacement?: ComponentProps<typeof Tooltip>['placement']
	to?: CommonLinkProps<T>['to']
	toParams?: CommonLinkProps<T>['params']
	sx?: SxProps<{}>
	alt?: string
	target?: React.HTMLAttributeAnchorTarget

	id?: string

	title?: string
	subtitle?: string

	startIcon?: React.ReactNode
	endIcon?: React.ReactNode

	loading?: boolean
	loadingPosition?: ComponentProps<typeof LoadingButton>['loadingPosition']
	disabled?: boolean
	type?: ComponentProps<typeof LoadingButton>['type']

	className?: string

	disableUppercase?: boolean

	// aliases
	small?: boolean
	outlined?: boolean
	contained?: boolean
}

export const Button = memo(
	forwardRef(function Button<T extends RoutesKeys>(
		{
			children = '',
			variant = 'contained',
			color = 'primary',
			size = 'medium',
			onClick,

			...props
		}: ButtonProps<T>,
		ref: React.Ref<HTMLButtonElement>
	) {
		const disabled = useMemo(
			() => props.loading || props.disabled,
			[props.loading, props.disabled]
		)

		size = props.small ? 'small' : size
		variant = props.outlined
			? 'outlined'
			: props.contained
			? 'contained'
			: variant

		const ButtonComponent = useCallback(
			() => (
				<Box
					sx={{
						...props.sx,
						color: isColorOfThemeType(color) ? undefined : color,
					}}
				>
					<LoadingButton
						loading={props.loading}
						disabled={disabled}
						variant={variant}
						color={isColorOfThemeType(color) ? color : 'inherit'}
						size={size}
						onClick={onClick}
						startIcon={props.startIcon}
						endIcon={props.endIcon}
						aria-label={props.alt || props.tooltip}
						type={props.type}
						id={props.id}
						className={props.className}
						ref={ref}
						sx={{
							width: '100%',
							height: '100%',
							...(color === 'primarygradient' &&
							!disabled &&
							!props.loading &&
							variant === 'contained'
								? {
										background: `linear-gradient(115deg, ${theme.palette.primary.main} 10%, ${theme.palette.primary.dark})`,
										color: 'white',
								  }
								: {}),

							textTransform: props.disableUppercase ? 'none' : undefined,
							...props.sx,
						}}
					>
						{children}
						<Box display={'flex'} flexDirection={'column'}>
							{props.title && (
								<Typography
									size={'1rem'}
									strong
									color="inherit"
									sx={{
										...(props.subtitle
											? { lineHeight: '1rem', marginTop: '0.2rem' }
											: {}),
									}}
								>
									{props.title}
								</Typography>
							)}
							{props.subtitle && (
								<Typography
									size={'0.8rem'}
									strong={500}
									color="inherit"
									sx={{ opacity: 0.8 }}
								>
									{props.subtitle}
								</Typography>
							)}
						</Box>
					</LoadingButton>
				</Box>
			),
			[
				children,
				props.sx,
				props.loading,
				disabled,
				variant,
				color,
				size,
				onClick,
				props.startIcon,
				props.endIcon,
				props.alt,
				props.type,
				props.id,
				props.className,
				props.title,
				props.subtitle,
				ref,
			]
		)

		const typedParams: CommonLinkProps<T>['params'] = useMemo(
			() => props.toParams as CommonLinkProps<T>['params'],
			[props.toParams]
		)

		const LinkComponent = useCallback(
			() =>
				props.to && !disabled ? (
					<CustomLink
						to={props.to}
						params={typedParams}
						sx={{
							...props.sx,
						}}
						target={props.target}
					>
						<ButtonComponent />
					</CustomLink>
				) : (
					<ButtonComponent />
				),
			[props.to, disabled, props.sx, typedParams, props.target, ButtonComponent]
		)

		return props.tooltip && !disabled ? (
			<Tooltip title={props.tooltip} placement={props.tooltipPlacement}>
				<LinkComponent />
			</Tooltip>
		) : (
			<LinkComponent />
		)
	})
)
