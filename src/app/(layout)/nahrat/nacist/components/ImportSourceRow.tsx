'use client'

import { Box, Typography } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import {
	ImageRounded,
	LinkRounded,
	PictureAsPdfRounded,
} from '@mui/icons-material'
import { ImportSource } from '../tech/importStorage'

/** What is being read: a tinted icon tile and the link or file name. */
export default function ImportSourceRow({ source }: { source: ImportSource }) {
	const Icon =
		source.kind === 'link'
			? LinkRounded
			: /\.pdf$/i.test(source.label)
			? PictureAsPdfRounded
			: ImageRounded

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
			<Box
				sx={(theme) => ({
					width: 36,
					height: 36,
					flexShrink: 0,
					borderRadius: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'primary.main',
					bgcolor: alpha(theme.palette.primary.main, 0.1),
				})}
			>
				<Icon fontSize="small" />
			</Box>
			<Typography strong={500} noWrap sx={{ minWidth: 0 }}>
				{source.label}
			</Typography>
		</Box>
	)
}
