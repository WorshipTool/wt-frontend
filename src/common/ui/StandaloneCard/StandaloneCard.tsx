import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box } from '@/common/ui/Box'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import breakpoints from '@/tech/theme/theme.tech'

import { useMemo } from 'react'

type StandaloneCardProps = {
	title: string
	subtitle?: string
	children?: React.ReactNode
	variant?: 'default' | 'secondary'
}

export function StandaloneCard(props: StandaloneCardProps) {
	const variant = useMemo(() => props.variant ?? 'default', [props.variant])
	const defaultVariant = useMemo(() => variant === 'default', [variant])
	return (
		<Box
			sx={{
				width: '480px',
				maxWidth: '100%',
			}}
		>
			<Box
				sx={{
					...SURFACE_CARD_SX,
					borderRadius: 5,
					padding: 2,
					paddingX: 8,
					paddingBottom: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: defaultVariant ? 'center' : 'start',

					[breakpoints.down('sm')]: {
						paddingX: 4,
					},
				}}
			>
				<Box
					display={'flex'}
					flexDirection={'row'}
					alignItems={'center'}
					gap={1}
				>
					<Typography
						size={defaultVariant ? '2.5rem' : '2rem'}
						strong={defaultVariant ? 600 : 400}
					>
						{props.title}
					</Typography>

					{!defaultVariant && (
						<>
							{/* <Box
								sx={{
									width: '16px',
									height: '16px',
									bgcolor: defaultVariant ? 'primary.main' : 'secondary.main',
								}}
							/> */}
						</>
					)}
				</Box>
				<Typography
					align={defaultVariant ? 'center' : 'left'}
					size={'1.1rem'}
					color="grey.600"
				>
					{props.subtitle}
				</Typography>
				{props.children !== undefined && <Gap value={2} />}
				{props.children}
			</Box>
		</Box>
	)
}
