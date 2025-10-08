import { RequireItemEditOutDto } from '@/api/generated'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import Popup from '@/common/components/Popup/Popup'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack } from '@/types/song'
import { BorderColor, Edit, FileCopy } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { VariantPackAlias } from '../../../../../../../../../../../interfaces/variant/songVariant.types'

type EditButtonsPanelProps = {
	inEditMode: boolean
	setInEditMode: (value: boolean) => void
	variant: ExtendedVariantPack
	onSave: () => void
	onCancel: () => void
	saving: boolean
}

export default function EditButtonsPanel({
	inEditMode,
	setInEditMode,
	variant,
	...props
}: EditButtonsPanelProps) {
	const t = useTranslations('teams.song')
	const { selection, reload, guid: teamGuid, alias: teamAlias } = useInnerTeam()

	const playlistItemGuid = useMemo(() => {
		return selection.items.find((i) => i.pack.packGuid === variant.packGuid)
			?.guid!
	}, [selection, variant])

	const needToBeCopied = useMemo(() => {
		return selection.songNeedToBeCopiedToEdit(variant)
	}, [])
	const { fetchApiState, apiState } = useApiState<RequireItemEditOutDto>()

	const [copyPopupOpen, setCopyPopupOpen] = useState(false)
	const navigate = useSmartNavigate()

	const onEditButtonClick = () => {
		if (needToBeCopied) {
			setCopyPopupOpen(true)
			return
		} else {
			setInEditMode(true)
		}
	}
	const createCopy = () => {
		fetchApiState(
			async () => {
				const result = await selection.requireItemEdit(playlistItemGuid)
				if (result.createdCopy) {
					const aliasData = parseVariantAlias(
						result.packAlias as VariantPackAlias
					)
					navigate(
						'teamSong',
						{
							alias: teamAlias,
							hex: aliasData.hex,
							'title-alias': aliasData.alias,
							edit: true,
						},
						{
							replace: true,
						}
					)
				}

				return result
			},
			(data) => {
				reload()

				setCopyPopupOpen(false)
			}
		)
	}

	const onSave = () => {
		setInEditMode(false)
		props.onSave()
	}

	const onCancel = () => {
		setInEditMode(false)
		props.onCancel()
	}

	const isSmall = useDownSize('md')
	const icon = needToBeCopied ? <BorderColor /> : <Edit />

	return (
		<>
			{!inEditMode ? (
				!isSmall ? (
					<Button
						color="secondary"
						size="small"
						// onClick={() => setInEditMode(true)}
						startIcon={icon}
						onClick={onEditButtonClick}
						tooltip={t('editTooltip')}
					>
						{t('edit')}
					</Button>
				) : (
					<SmartPortalMenuItem
						title={t('edit')}
						subtitle={t('editTooltip')}
						onClick={onEditButtonClick}
						icon={icon}
					/>
				)
			) : (
				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={1}
					justifyContent={'end'}
				>
					<Button
						color="grey.800"
						size="small"
						onClick={onCancel}
						disabled={props.saving}
					>
						{t('cancel')}
					</Button>
					<Button
						color="secondary"
						size="small"
						onClick={onSave}
						loading={props.saving}
					>
						{t('save')}
					</Button>
				</Box>
			)}

			<Popup
				open={copyPopupOpen}
				onClose={() => setCopyPopupOpen(false)}
				onSubmit={createCopy}
				icon={<FileCopy />}
				title={t('copyTitle')}
				width={400}
				actions={
					<>
						<Button
							size="small"
							variant="text"
							color="grey.800"
							type="reset"
							disabled={apiState.loading}
						>
							{t('cancel')}
						</Button>
						<Button size="small" type="submit" loading={apiState.loading}>
							{!apiState.loading ? t('continue') : t('copying')}
						</Button>
					</>
				}
			>
				<Typography>
					{t('copyDescription')}
				</Typography>
			</Popup>
		</>
	)
}
