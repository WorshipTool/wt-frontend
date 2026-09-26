import Popup from '@/common/components/Popup/Popup'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { Box } from '@/common/ui/Box'
import {
	SongVariantCard,
	ToLinkProps,
} from '@/common/ui/SongCard/SongVariantCard'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'

type Props = {
	open: boolean
	onClose: () => void
	packs: BasicVariantPack[]

	toLinkProps?: ToLinkProps
}

export default function TranslationsSelectPopup(props: Props) {
	const t = useTranslations('song.translations')
	// A phone reaches this from a list row now (SongGroupRow), not from a card on
	// a wide canvas: four lines of lyric at full width clip mid-word there, so the
	// choices read as rows, like everything else in the list they came from.
	const phone = useIsPhone()

	return (
		<>
			<Popup
				open={props.open}
				onClose={props.onClose}
				title={t('selectOther')}
			>
				<Box
					maxHeight={600}
					overflow="auto"
					display={'flex'}
					gap={1}
					flexDirection={'column'}
				>
					{props.packs.map((d) => (
						<Box key={d.packGuid} position={'relative'}>
							<SongVariantCard
								key={d.packGuid}
								data={d}
								dense={phone}
								previewLines={phone ? 2 : undefined}
								properties={['SHOW_PRIVATE_LABEL', 'ENABLE_TRANSLATION_LIKE']}
								toLinkProps={props.toLinkProps}
							/>
						</Box>
					))}
				</Box>
			</Popup>
		</>
	)
}
