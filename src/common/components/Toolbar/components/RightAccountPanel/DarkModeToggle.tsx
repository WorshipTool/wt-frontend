'use client'
import { useDarkMode } from '@/app/providers/DarkModeProvider'
import { IconButton, Tooltip } from '@/common/ui'
import { DarkMode, LightMode } from '@mui/icons-material'
import { SxProps, Theme } from '@mui/system'
import { useTranslations } from 'next-intl'

interface DarkModeToggleProps {
	iconStyle?: SxProps<Theme>
	iconButtonStyle?: SxProps
	fontSize?: 'small' | 'medium' | 'large'
}

export default function DarkModeToggle({
	iconStyle,
	iconButtonStyle,
	fontSize = 'medium',
}: DarkModeToggleProps) {
	const { isDarkMode, toggleDarkMode } = useDarkMode()
	const tNavigation = useTranslations('navigation')

	const tooltipKey = isDarkMode ? 'tooltips.lightMode' : 'tooltips.darkMode'

	return (
		<Tooltip title={tNavigation(tooltipKey)}>
			<IconButton
				color="inherit"
				sx={iconButtonStyle}
				onClick={toggleDarkMode}
			>
				{isDarkMode ? (
					<LightMode sx={iconStyle} fontSize={fontSize} />
				) : (
					<DarkMode sx={iconStyle} fontSize={fontSize} />
				)}
			</IconButton>
		</Tooltip>
	)
}
