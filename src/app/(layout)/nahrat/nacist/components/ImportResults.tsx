'use client'

import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import PageAction from '@/common/components/PageAction/PageAction'
import Popup from '@/common/components/Popup/Popup'
import { Box, Button, Typography } from '@/common/ui'
import { ArrowForwardRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { StoredImportResult } from '../tech/importStorage'
import ImportedSongCard from './ImportedSongCard'
import ImportedSongList from './ImportedSongList'

type ImportResultsProps = {
	result: StoredImportResult
	/** Continue with this song — into the editor. Final: the list is dropped. */
	onContinue: (index: number) => void
	onReset: () => void
}

/**
 * The found songs; the user picks one and continues with it.
 *
 * One button, outside the cards, always meaning the song in the preview:
 * on a desktop under the list in the left column (the preview on the right
 * has no buttons), on a phone docked above the tab bar through `PageAction`,
 * so it is reachable without scrolling past the preview. One song has no list
 * and no columns: the song across the page, the button at the top right.
 * The first song starts chosen.
 */
export default function ImportResults(props: ImportResultsProps) {
	const t = useTranslations('upload.import.result')
	const tCommon = useTranslations('common')
	const [confirmReset, setConfirmReset] = useState(false)
	const { songs } = props.result
	const count = songs.length
	const [selected, setSelected] = useState(0)
	const previewRef = useRef<HTMLDivElement>(null)

	const select = (index: number) => {
		setSelected(index)
		// on a phone the preview is under the list: bring its top into view
		requestAnimationFrame(() =>
			previewRef.current?.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			}),
		)
	}

	const loadAnotherButton = (fullWidth: boolean) => (
		<Button
			variant="outlined"
			onClick={() => setConfirmReset(true)}
			sx={fullWidth ? { width: '100%' } : undefined}
		>
			{t('loadAnother')}
		</Button>
	)
	const loadAnother = loadAnotherButton(false)

	// Starting again throws the found songs away — ask first
	const resetPopup = (
		<Popup
			open={confirmReset}
			onClose={() => setConfirmReset(false)}
			title={t('resetConfirm.title')}
			subtitle={t('resetConfirm.text')}
			width={400}
			actions={[
				<Button type="reset" variant="outlined" key="cancel">
					{tCommon('cancel')}
				</Button>,
				<Button
					key="reset"
					onClick={() => {
						setConfirmReset(false)
						props.onReset()
					}}
				>
					{t('resetConfirm.confirm')}
				</Button>,
			]}
		/>
	)

	const header = (
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="h5" strong={600}>
				{t('found', { count })}
			</Typography>
			<Typography small color="grey.600" noWrap>
				{t('foundFrom', { count, source: props.result.source.label })}
			</Typography>
		</Box>
	)

	const continueButton = (fullWidth: boolean) => (
		<PageAction>
			<Button
				endIcon={<ArrowForwardRounded />}
				onClick={() => props.onContinue(selected)}
				sx={fullWidth ? { width: '100%' } : undefined}
			>
				{t('continue')}
			</Button>
		</PageAction>
	)

	// One song: nothing to pick, so no two columns — the song across the page with
	// the way on at the top right next to the heading, visible however long the
	// song is. On a phone the button docks above the tab bar as with more songs.
	if (count === 1)
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				{resetPopup}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						flexWrap: 'wrap',
						gap: 2,
					}}
				>
					{header}
					<Box
						sx={(theme) => ({
							display: 'none',
							alignItems: 'center',
							gap: 1,
							[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
								display: 'flex',
							},
						})}
					>
						{loadAnother}
						{continueButton(false)}
					</Box>
				</Box>
				<ImportedSongCard song={songs[0]} />
				{/* phone: the button above (PageAction) docks over the tab bar even inside the
				    hidden desktop row — a portal; the quiet way out stays under the song */}
				<Box
					sx={(theme) => ({
						display: 'flex',
						justifyContent: 'center',
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
					})}
				>
					{loadAnother}
				</Box>
			</Box>
		)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			{resetPopup}
			{header}

			<Box
				sx={(theme) => ({
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
						display: 'grid',
						gridTemplateColumns: 'minmax(240px, 2fr) minmax(0, 3fr)',
						alignItems: 'start',
					},
				})}
			>
				{/* the left column on a desktop; on a phone its parts join the page's
				    column (the button docks, so it leaves no empty slot behind) */}
				<Box
					sx={(theme) => ({
						display: 'contents',
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
						},
					})}
				>
					<ImportedSongList
						songs={songs}
						selected={selected}
						onSelect={select}
					/>
					{continueButton(true)}
					<Box
						sx={(theme) => ({
							display: 'none',
							justifyContent: 'center',
							[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
								display: 'flex',
							},
						})}
					>
						{loadAnotherButton(true)}
					</Box>
				</Box>

				<Box ref={previewRef} sx={{ minWidth: 0 }}>
					<ImportedSongCard key={selected} song={songs[selected]} />
				</Box>
			</Box>

			{/* phone: the quiet way out under the preview; the button is docked */}
			<Box
				sx={(theme) => ({
					display: 'flex',
					justifyContent: 'center',
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
				})}
			>
				{loadAnother}
			</Box>
		</Box>
	)
}
