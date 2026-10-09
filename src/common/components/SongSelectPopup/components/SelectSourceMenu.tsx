'use client'
import Menu from '@/common/components/Menu/Menu'
import { SelectOption } from '@/common/components/SongSelectPopup/components/SelectFromOptions'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { KeyboardArrowDown } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

type SelectSourceMenuProps = {
	options: SelectOption[]
	selected: number
	onSelect: (item: SelectOption, index: number) => void
}

const withCount = (option: SelectOption) =>
	option.count === undefined ? option.label : `${option.label} (${option.count})`

/**
 * Which songbook the picker is offering — the same three sources as the row of
 * tabs on a desktop, but as one line with a menu.
 *
 * On a phone the tabs do not fit: the row scrolls sideways, the third label is
 * cut mid-word, and a tab nobody can see is a tab nobody knows about. A menu
 * shows all three whole for one tap more, and gives the rest of the sheet to
 * the songs. The word "Zdroj:" stays in the line on purpose — it is what says
 * the line can be switched, now that there is no second tab beside it to say
 * so.
 */
export default function SelectSourceMenu(props: SelectSourceMenuProps) {
	const t = useTranslations('songSelect')
	// The menu hangs off this wrapper, not off the button inside it: `Button`
	// rebuilds its own DOM node on every render, so an element taken from the
	// click is detached by the time the menu measures it — and a menu measuring
	// a detached anchor lands in the corner of the screen.
	const anchorRef = useRef<HTMLDivElement | null>(null)
	const [open, setOpen] = useState(false)

	const current = props.options[props.selected]

	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			alignItems={'flex-start'}
			gap={1}
		>
			<Box ref={anchorRef} sx={{ display: 'inline-flex' }}>
				<Button
					variant="outlined"
					color="grey.700"
					size="small"
					disableUppercase
					endIcon={<KeyboardArrowDown />}
					onClick={() => setOpen(true)}
				>
					{t('source', { source: current?.label ?? '' })}
				</Button>
			</Box>

			<Menu
				open={open}
				anchor={anchorRef.current}
				onClose={() => setOpen(false)}
				items={props.options.map((option, i) => ({
					title: withCount(option),
					selected: i === props.selected,
					onClick: () => props.onSelect(option, i),
				}))}
			/>

			{/* the chosen source may bring its own controls with it — the team
			    songbook asks which team */}
			{current?.optionsComponent && (
				<Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
					{current.optionsComponent}
				</Box>
			)}
		</Box>
	)
}
