'use client'

import { ImportSourceKind } from '@/app/(layout)/nahrat/nacist/tech/importStorage'
import { Box, Typography } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import { InfoRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

/** "Načteno z odkazu — zkontroluj text a akordy", above a prefilled editor. */
export default function ImportedNotice({ kind }: { kind: ImportSourceKind }) {
	const t = useTranslations('upload.import.editor')

	return (
		<Box
			role="note"
			sx={(theme) => ({
				display: 'flex',
				alignItems: 'flex-start',
				gap: 1,
				paddingX: 1.5,
				paddingY: 1,
				borderRadius: 2,
				bgcolor: alpha(theme.palette.primary.main, 0.1),
			})}
		>
			<InfoRounded
				fontSize="small"
				sx={{ color: 'primary.main', marginTop: 0.25 }}
			/>
			<Typography small>
				{t.rich(kind === 'link' ? 'fromLink' : 'fromFile', {
					strong: (chunks) => <strong>{chunks}</strong>,
				})}
			</Typography>
		</Box>
	)
}
