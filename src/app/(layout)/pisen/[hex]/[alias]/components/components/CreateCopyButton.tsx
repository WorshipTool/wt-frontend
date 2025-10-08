'use client'

import { VariantPackAlias } from '@/api/dtos'
import { useInnerPackSong } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Button, CircularProgress, Gap, Tooltip } from '@/common/ui'
import { ListItemIcon, ListItemText, MenuItem } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { VariantPackGuid } from '@/types/song'
import { EggAlt } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { PostCreateCopyOutDto } from '../../../../../../../api/generated'
import { useApi } from '../../../../../../../api/tech-and-hooks/useApi'
import { useSmartNavigate } from '../../../../../../../routes/useSmartNavigate'
import { useApiState } from '../../../../../../../tech/ApiState'

export type CreateCopyButtonProps = {
	packGuid: VariantPackGuid
	asMenuItem?: boolean
}

export default function CreateCopyButton(props: CreateCopyButtonProps) {
	const { songAddingApi } = useApi()
	const tCopy = useTranslations('songPage.createCopy')

	const { fetchApiState, apiState } = useApiState<PostCreateCopyOutDto>()
	const navigate = useSmartNavigate()

	const onClick = async () => {
		await fetchApiState(
			async () => {
				const result = await songAddingApi.createCopy({
					packGuid: props.packGuid,
				})

				return result
			},
			(data) => {
				navigate('variant', {
					...parseVariantAlias(data.alias as VariantPackAlias),
				})
			}
		)
	}

const isSmall = useDownSize('lg')
	const icon = <EggAlt color="inherit" />

	const { user } = useAuth()
	const { variant } = useInnerPackSong()
	const isOwner = useMemo(() => {
		if (!user) return false
		return variant.createdByGuid === user?.guid
	}, [user, variant])

	const showAsButton = !(isOwner && !variant.public)

	return props.asMenuItem ? (
		<>
			<MenuItem onClick={onClick} disabled={apiState.loading}>
				<ListItemIcon>
					{apiState.loading ? (
						<CircularProgress size={`1rem`} color="inherit" />
					) : (
						icon
					)}
				</ListItemIcon>
				<ListItemText primary={tCopy('menu')} />
			</MenuItem>
			<Gap value={0.5} />
		</>
	) : (
		<>
			{!isSmall && showAsButton ? (
				<Tooltip title={tCopy('tooltip')}>
					<Button
						color="success"
						variant="contained"
						startIcon={icon}
						loading={apiState.loading}
						onClick={onClick}
					>
						{tCopy('button')}
					</Button>
				</Tooltip>
			) : (
				<>
					<SmartPortalMenuItem
						title={tCopy('button')}
						subtitle={tCopy('subtitle')}
						icon={icon}
						onClick={onClick}
					/>
				</>
			)}
		</>
	)
}
