'use client'

import {
	MobileAppHeader,
	MobileHeaderPill,
} from '@/common/components/MobileAppHeader'
import { CheckRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import MobileSongEditor from './MobileSongEditor'
import NotValidWarning from './NotValidWarning'

type WriteSongMobileProps = {
	onTitleChange: (title: string) => void
	onSheetDataChange: (sheetData: string) => void
	/** True when the sheet is complete enough to create the song. */
	canCreate: boolean
	posting: boolean
	/** Show the "content isn't valid yet" hint (non-empty but invalid). */
	showInvalidWarning: boolean
	onCreate: () => void
}

/**
 * Phone version of the manual song editor. Wraps the interactive
 * MobileSongEditor (full-height text field + one bottom row of section markers
 * and an add-chord button + a live chord picker) in the mobile app shell: a
 * "Sepsat ručně" header whose single primary action is a "Vytvořit" pill,
 * disabled until the sheet is valid — instead of the desktop's side-by-side
 * editor/preview with a bottom button (which overflowed on phones). The desktop
 * layout stays in page.tsx.
 */
export default function WriteSongMobile(props: WriteSongMobileProps) {
	const t = useTranslations('upload')

	return (
		<MobileAppHeader
			title={t('writeManually')}
			backTo="addMenu"
			surface="background.paper"
			actions={[
				<MobileHeaderPill
					key="create"
					icon={<CheckRounded />}
					onClick={props.onCreate}
					disabled={!props.canCreate}
					loading={props.posting}
					alt={t('create')}
				>
					{t('create')}
				</MobileHeaderPill>,
			]}
		>
			<MobileSongEditor
				onTitleChange={props.onTitleChange}
				onSheetDataChange={props.onSheetDataChange}
			/>
			{props.showInvalidWarning && <NotValidWarning />}
		</MobileAppHeader>
	)
}
