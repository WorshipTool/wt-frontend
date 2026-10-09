'use client'
import TeamCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamCard/TeamCard'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box, CircularProgress, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { CommonLinkProps, Link } from '@/common/ui/Link/Link'
import { grey } from '@/common/ui/mui/colors'
import { Typography } from '@/common/ui/Typography'
import { RoutesKeys } from '@/routes'
import React, { ReactNode, useMemo } from 'react'

type TeamQuickActionButtonProps = {
	label: string
	secondaryLabel?: string
	tooltip: string
	icon: React.ReactNode

	onClick?: () => void
	disabled?: boolean
	loading?: boolean

	color?: 'primary' | 'secondary' | 'white'
	to?: CommonLinkProps<RoutesKeys>['to']
	toParams?: CommonLinkProps<RoutesKeys>['params']
}

export default function TeamQuickActionButton({
	onClick,
	disabled,
	loading,
	color = 'primary',
	...props
}: TeamQuickActionButtonProps) {
	const flex = useDownSize('sm')

	const theme = useTheme()
	const dis = useMemo(() => disabled || loading, [disabled, loading])

	const LinkEnvelope = ({ children }: { children: ReactNode }) => {
		return props.to && props.toParams ? (
			<Link to={props.to} params={props.toParams}>
				{children}
			</Link>
		) : (
			children
		)
	}

	const DEFAULT_WIDTH = 130

	return (
		<Box
			sx={{
				flexGrow: flex ? 1 : 0,
				minWidth: DEFAULT_WIDTH,
			}}
		>
			<LinkEnvelope>
				<Tooltip label={props.tooltip} disabled={dis}>
					<Clickable onClick={onClick} disabled={dis}>
						<TeamCard
							sx={{
								display: 'flex',
								flexDirection: 'column',
								height: flex ? undefined : '5.5rem',

								transition: 'all 0.3s',

								...(disabled
									? {
											background: grey[300],
											color: 'grey.400',
									  }
									: color === 'primary'
									? {
											background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
											color: 'white',
											// no card hairline around a coloured tile
											borderColor: 'transparent',
									  }
									: color === 'secondary'
									? {
											background: theme.palette.secondary.main,
											color: 'black',
											borderColor: 'transparent',
									  }
									: {
											bgcolor: 'surface.card',
											color: 'black',
									  }),
							}}
						>
							<Box flex={1} paddingRight={'1rem'}>
								<Typography
									variant="h6"
									strong
									// strong={500}
									sx={{ userSelect: 'none' }}
									// lineHeight={'inherit'}
								>
									{props.label}
								</Typography>
							</Box>
							<Box
								display={'flex'}
								flexDirection={'row'}
								justifyContent={'space-between'}
								alignItems={'end'}
								gap={1}
							>
								{props.secondaryLabel ? (
									<Typography
										strong={500}
										sx={{ userSelect: 'none', opacity: 0.5 }}
										noWrap
										// lineHeight={'inherit'}
									>
										{props.secondaryLabel}
									</Typography>
								) : (
									<Box />
								)}

								{disabled ? (
									<CircularProgress size={'2rem'} color="inherit" />
								) : (
									props.icon
								)}
							</Box>
						</TeamCard>
					</Clickable>
				</Tooltip>
			</LinkEnvelope>
		</Box>
	)
}
