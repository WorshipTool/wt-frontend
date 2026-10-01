import { Box, IconButton } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { ChevronLeft } from '@mui/icons-material'
import { useMemo, useState } from 'react'

export type SelectOption = {
	label: string
	count?: number
	optionsComponent?: React.ReactNode
}

type Item = SelectOption

type SelectFromOptionsProps = {
	options: Item[]
	initialSelected: number
	onSelect: (item: Item, index: number) => void
}
export default function SelectFromOptions(props: SelectFromOptionsProps) {
	const [selected, setSelected] = useState(props.initialSelected)
	const selectedFocused = useMemo(() => {
		return !!props.options[selected].optionsComponent
	}, [props.options, selected])
	const options: Item[] = props.options

	const onChange = (index: number) => {
		setSelected(index)
		const e = options[index]

		props.onSelect(e, index)
	}

	return (
		<Box
			display={'flex'}
			flexDirection={'row'}
			gap={selectedFocused ? 0 : 1}
			sx={{
				transition: 'all 0.2s',
				overflowX: 'auto',
				overflowY: 'hidden',
				'&::-webkit-scrollbar': {
					display: 'none',
				},
			}}
		>
			{options.map((option, i) => {
				const isSelected = i === selected
				const focused = selectedFocused && isSelected
				return (
					<Box key={option.label} display={'flex'} flexDirection={'row'}>
						{focused && (
							<Box
								sx={{
									height: '10px',
								}}
							>
								<IconButton
									onClick={() => onChange(0)}
									size="small"
									sx={{
										transform: 'translateY(-3px)',
										marginRight: '4px',
									}}
								>
									<ChevronLeft fontSize="small" />
								</IconButton>
							</Box>
						)}
						<Box
							onClick={() => onChange(i)}
							sx={{
								cursor: 'pointer',
								opacity: !isSelected && selectedFocused ? 0 : 1,
								transition: 'all 0.3s',
								display: 'flex',
								flexDirection: 'row',
								gap: 2,
							}}
						>
							<Typography
								color={isSelected ? 'black' : 'text.disabled'}
								sx={{
									userSelect: 'none',
									maxWidth: !isSelected && selectedFocused ? '0px' : '300px',
									transition: 'all 0.3s',
								}}
								noWrap
							>
								{option.label}{' '}
								{option.count !== undefined && ` (${option.count})`}
							</Typography>

							{focused && (
								<Box
									display={'flex'}
									flexDirection={'row'}
									alignItems={'center'}
								>
									{option.optionsComponent}
								</Box>
							)}
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}
