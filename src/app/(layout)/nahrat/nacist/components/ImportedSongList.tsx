'use client'

import { GeneralParserSong } from '@/api/general-parser/generalParser'
import {
	Box,
	GroupCard,
	GroupDivider,
	SongLeadingIcon,
	Typography,
} from '@/common/ui'
import { CustomChip } from '@/common/ui/CustomChip/CustomChip'
import { alpha } from '@/common/ui/mui'
import { CheckRounded, WarningAmberRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { SavedSong } from '../tech/importStorage'
import { firstLyricLine } from '../tech/sheetPreview'
import { NEEDS_CHECK_BELOW } from './ImportedSongCard'

type ImportedSongListProps = {
	songs: GeneralParserSong[]
	saved: Record<number, SavedSong>
	selected: number
	onSelect: (index: number) => void
}

/**
 * The found songs as one group of rows — the app's list language (GroupCard,
 * the note tile, inset hairlines), so it reads like a song list anywhere else.
 * Each row: title, the first lyric line, and a chip when it was saved or needs
 * a check. The chosen row is a tint and a tick, as in the song picker.
 */
export default function ImportedSongList(props: ImportedSongListProps) {
	const t = useTranslations('upload.import.result')

	return (
		<GroupCard>
			<Box component="ul" sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{props.songs.map((song, index) => {
					const chosen = index === props.selected
					const saved = props.saved[index]
					return (
						<Fragment key={`${song.source.index}-${index}`}>
							{index > 0 && <GroupDivider />}
							<Box component="li">
								<Box
									component="button"
									type="button"
									aria-pressed={chosen}
									onClick={() => props.onSelect(index)}
									sx={(theme) => ({
										width: '100%',
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										paddingX: 2,
										paddingY: 1.25,
										border: 'none',
										font: 'inherit',
										textAlign: 'left',
										cursor: 'pointer',
										color: 'text.primary',
										bgcolor: chosen
											? alpha(theme.palette.primary.main, 0.1)
											: 'transparent',
										transition: 'background-color 0.15s',
										'&:hover': {
											bgcolor: chosen
												? alpha(theme.palette.primary.main, 0.1)
												: 'surface.shell',
										},
										'&:focus-visible': {
											outline: `2px solid ${theme.palette.primary.main}`,
											outlineOffset: -2,
										},
									})}
								>
									<SongLeadingIcon />
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography
											strong
											noWrap
											color={chosen ? 'primary.main' : undefined}
										>
											{song.title || t('untitled')}
										</Typography>
										<Typography small color="grey.600" noWrap>
											{firstLyricLine(song.sheetData)}
										</Typography>
									</Box>
									{saved ? (
										<CustomChip
											color="success.dark"
											icon={<CheckRounded />}
											label={t('saved')}
										/>
									) : (
										song.confidence < NEEDS_CHECK_BELOW && (
											<CustomChip
												color="warning.dark"
												icon={<WarningAmberRounded />}
												label={t('needsCheck')}
											/>
										)
									)}
									<CheckRounded
										aria-hidden
										sx={{
											color: 'primary.main',
											flexShrink: 0,
											visibility: chosen ? 'visible' : 'hidden',
										}}
									/>
								</Box>
							</Box>
						</Fragment>
					)
				})}
			</Box>
		</GroupCard>
	)
}
