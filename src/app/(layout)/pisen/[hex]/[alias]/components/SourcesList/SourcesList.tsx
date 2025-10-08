'use client'

import { Box, Typography } from '@/common/ui'
import { ExtendedVariantPack } from '@/types/song'
import { Gap } from '../../../../../../../common/ui/Gap'
import SourceListItem from './SourceListItem'
import { useTranslations } from 'next-intl'

export type SongPageProps = {
	variant: ExtendedVariantPack
}
export function SourcesList({ variant }: SongPageProps) {
	const tSources = useTranslations('songPage.sources')
	return (
		<Box>
			<Typography>{tSources('title')}</Typography>
			<Gap value={0.25} />
			<Box display={'flex'} flexWrap={'wrap'} gap={1}>
				{variant.sources?.map((source, index) => (
					<SourceListItem key={source.value} source={source} />
				))}
			</Box>
		</Box>
	)
}
