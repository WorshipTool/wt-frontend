'use client'

import { CreatedType, SongDto, VariantPackAlias } from '@/api/dtos'
import { EditVariantOutDto, PostEditVariantInDto } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { isSheetDataValid } from '@/tech/sheet.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useMemo } from 'react'

type UseSongEditingParams = {
	variant: ExtendedVariantPack
	sheet: Sheet
	/** The (possibly edited) title currently shown in the editor. */
	editedTitle: string
	/** Enter or leave edit mode — owned by the page. */
	setEditMode: (editable: boolean) => Promise<void> | void
}

export type SongEditing = {
	/** `true` to enter edit mode, `false` to save and leave it. */
	onEditClick: (editable: boolean) => Promise<void>
	saving: boolean
	anyChange: boolean
	isValid: boolean
}

/**
 * The song page's edit/save behaviour, shared by the desktop `TopPanel` and the
 * phone `MobileSongDock`.
 *
 * Both surfaces used to compute this separately — and the phone dock didn't,
 * passing `saving={false}` / `anyChange={false}` and wiring its edit button
 * straight to `setInEditMode`, which skipped the "can't edit a published song"
 * guard the desktop applies. Owning it in one place keeps the two honest.
 */
export function useSongEditing({
	variant,
	sheet,
	editedTitle,
	setEditMode,
}: UseSongEditingParams): SongEditing {
	const tSongPage = useTranslations('songPage')
	const { enqueueSnackbar } = useSnackbar()
	const navigate = useSmartNavigate()

	const { songEditingApi } = useApi()
	const {
		fetchApiState,
		apiState: { loading: saving },
	} = useApiState<EditVariantOutDto>()

	const anyChange = useMemo(() => {
		const titleChanged = variant.title !== editedTitle
		const sheetChanged =
			new Sheet(variant?.sheetData).toString() !== sheet?.toString()
		return titleChanged || sheetChanged
	}, [sheet, editedTitle, variant])

	const isValid = useMemo(() => {
		if (!sheet) return false
		return isSheetDataValid(sheet.toString())
	}, [sheet])

	const onEditClick = async (editable: boolean) => {
		if (editable) {
			if (variant.verified) {
				enqueueSnackbar(tSongPage('topPanel.cannotEditPublished'))
				return
			}
			await setEditMode(editable)
			return
		}

		const body: PostEditVariantInDto = {
			variantAlias: variant.packAlias,
			sheetData: sheet.getOriginalSheetData(),
			title: editedTitle,
			createdType: CreatedType.Manual,
		}
		fetchApiState(
			async () => {
				return await songEditingApi.editVariant(body)
			},
			async (result) => {
				await setEditMode(editable)
				const message = variant.title
					? tSongPage('topPanel.updateSuccess.withTitle', {
							title: variant.title,
						})
					: tSongPage('topPanel.updateSuccess.withoutTitle')
				enqueueSnackbar(message)
				navigate('variant', {
					...parseVariantAlias(result.alias as VariantPackAlias),
				})
			}
		)
	}

	return { onEditClick, saving, anyChange, isValid }
}
