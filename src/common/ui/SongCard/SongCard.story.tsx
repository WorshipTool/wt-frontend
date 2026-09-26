import { ChevronRightRounded, MusicNoteRounded } from '@mui/icons-material'
import {
	BasicVariantPack,
	VariantPackAlias,
	VariantPackGuid,
} from '../../../api/dtos'
import { createStory } from '../../../app/(layout)/storybook/createStory'
import { Box } from '../Box'
import { SongVariantCard } from './SongVariantCard'

const SongCardStory = () => {
	const data: BasicVariantPack = {
		packGuid: 'guid' as VariantPackGuid,
		title: 'Lorem ipsum',
		sheetData: '{V1}Lorem ipsum[C] \nnechodim na uprum\nTestovaci akordy[Am]',
		packAlias: '13adf4-asf-akaj' as VariantPackAlias,
		public: false,
	} as BasicVariantPack

	// leading/trailing icon slots — the flattened mobile-list-row look
	const leadingIcon = (
		<Box
			sx={{
				width: 40,
				height: 40,
				borderRadius: 2,
				bgcolor: 'grey.100',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<MusicNoteRounded sx={{ fontSize: 20, color: 'grey.600' }} />
		</Box>
	)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<SongVariantCard data={data} />
			<SongVariantCard data={data} dense />
			<SongVariantCard
				data={data}
				dense
				previewLines={1}
				leadingIcon={leadingIcon}
				trailingIcon={<ChevronRightRounded sx={{ color: 'grey.400' }} />}
			/>
		</div>
	)
}

createStory(SongVariantCard, SongCardStory)
