import { Box } from '@/common/ui'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { cloneElement } from 'react'

type AboutInfoDatabaseProps = {
	order: number
	title: string
	text?: string
	icon?: React.ReactElement
}
export default function AboutInfoDatabase(props: AboutInfoDatabaseProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'start',

				...SURFACE_CARD_SX,
				padding: 3,
				borderRadius: 4,
			}}
			maxWidth={300}
			gap={1}
		>
			{props.icon && (
				<>
					{cloneElement(props.icon, { sx: { fontSize: 'inherit' } })}
					<Gap />
				</>
			)}
			<Box padding={0}>
				<Typography
					variant="h4"
					strong
					sx={{
						textWrap: 'nowrap',
					}}
				>
					{/* {props.order + 1}.  */}
					{props.title}
				</Typography>
			</Box>
			<Typography variant="h5" color="grey.600">
				{props.text}
			</Typography>
		</Box>
	)
}
