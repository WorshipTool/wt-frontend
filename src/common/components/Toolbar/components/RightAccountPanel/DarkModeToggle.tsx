'use client'

import { useThemeMode } from '@/common/providers/ThemeMode/ThemeModeContext'
import { IconButton } from '@/common/ui'
import { DarkMode, LightMode } from '@mui/icons-material'
import { SxProps } from '@mui/system'
import React from 'react'

interface DarkModeToggleProps {
	iconSx?: SxProps
	buttonSx?: SxProps
}

export default function DarkModeToggle({ iconSx, buttonSx }: DarkModeToggleProps) {
	const { mode, toggleMode } = useThemeMode()

	const isDark = mode === 'dark'
	const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

	return (
		<span data-testid="dark-mode-toggle">
			<IconButton
				tooltip={label}
				alt={label}
				color="inherit"
				sx={{ marginLeft: -0.25, pointerEvents: 'auto', ...buttonSx }}
				onClick={toggleMode}
			>
				{isDark ? (
					<LightMode sx={iconSx} fontSize="medium" />
				) : (
					<DarkMode sx={iconSx} fontSize="medium" />
				)}
			</IconButton>
		</span>
	)
}
