'use client'

import { BasicVariantPack, VariantPackAlias, VariantPackGuid } from '@/api/dtos'
import { createStory } from '@/app/(layout)/storybook/createStory'
import { Box } from '@/common/ui/Box'
import { SongLeadingIcon } from '@/common/ui/GroupList'
import SongGroupCard from '@/common/ui/SongCard/SongGroupCard'
import { SongVariantCard } from '@/common/ui/SongCard/SongVariantCard'
import { Typography } from '@/common/ui/Typography'
import useAuth from '@/hooks/auth/useAuth'
import { PackTranslationType } from '@/types/song'
import { ChevronRightRounded } from '@mui/icons-material'
import { ReactNode } from 'react'

/**
 * Every state a song card can be in, side by side — the card the desktop's
 * results are made of, the row the phone's list is made of, and the pile a song
 * with translations turns into either way.
 *
 * The two widths are the real ones: a card lives in a four-column masonry at
 * desktop width, a row lives in a phone-width list. Shown at any other width
 * they lie about where the text wraps and where the pile's edges land, which is
 * most of what these states are about.
 */
const CARD_WIDTH = 280
const ROW_WIDTH = 390

/** Lines short enough to sit one per line on a card — the common case. */
const SHEET = [
	'{Sloka 1}',
	'[C]Pane, Ty jsi mé útočiště,',
	'[G]v Tobě mám pokoj i sílu,',
	'[Am]ráno i večer Tě vyhlížím,',
	'[F]celý můj život je Tvůj.',
	'{Refrén}',
	'[C]A je čas zpívat Tvou píseň zas,',
	'[G]cokoli se může stát,',
	'[Am]a cokoli leží za mnou,',
	'[F]já budu zpívat, než zas přijde noc.',
].join('\n')

/**
 * A line too long for the card. It does not wrap: the sheet parser joins lyrics
 * with non-breaking spaces (so a chord never drifts off its syllable), which
 * leaves the whole line one unbreakable word — the card cuts it off at its edge.
 */
const LONG_SHEET = [
	'{Sloka}',
	'Chvalozpěv našemu Bohu, kterého celá země i nebesa vyvyšují bez konce,',
	'uvidí to mnozí a pojme je bázeň a budou doufat v Hospodina zástupů,',
	'novou píseň vložil mi do úst, chvalozpěv našemu Bohu, zazpívám,',
	'vyvýším Tvé jméno nad všechna jména, která kdy byla vyslovena.',
].join('\n')

/**
 * …except at a hyphen, which is a break the non-breaking spaces do not cover.
 * That is the one way four lines of a song can stand eight lines tall, and the
 * reason the preview is capped at four line heights rather than four lines.
 */
const HYPHEN_SHEET = [
	'{Sloka}',
	'Chvalozpěv našemu Bohu - zazpívám,',
	'uvidí to mnozí a pojme je bázeň - a budou doufat v Hospodina,',
	'novou píseň vložil mi do úst - chvalozpěv našemu Bohu,',
	'blaze muži, který doufá v Hospodina - a nehledí na vzpurné,',
].join('\n')

let guidCounter = 0

/** A stand-in song. Each one gets its own guid so the like counters, the drag
 * handles and the stacks in a pile don't share state with each other. */
const pack = (over: Partial<BasicVariantPack> = {}): BasicVariantPack =>
	({
		packGuid: `story-pack-${guidCounter++}` as VariantPackGuid,
		packAlias: 'a1b2c3-zpivat-tvou-pisen' as VariantPackAlias,
		title: 'Zpívat Tvou píseň',
		sheetData: SHEET,
		public: true,
		verified: true,
		ggValidated: true,
		language: 'cs',
		translationType: PackTranslationType.Original,
		translationLikes: 0,
		createdByLoader: false,
		publishedAt: null,
		...over,
	} as BasicVariantPack)

/** One state, captioned, at the width it is meant to be seen at. */
function Case({
	label,
	width = CARD_WIDTH,
	children,
}: {
	label: string
	width?: number
	children: ReactNode
}) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
				width,
				maxWidth: '100%',
			}}
		>
			<Typography small strong uppercase color="grey.600">
				{label}
			</Typography>
			{children}
		</Box>
	)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			<Typography strong>{title}</Typography>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: 3,
					alignItems: 'flex-start',
				}}
			>
				{children}
			</Box>
		</Box>
	)
}

const SongCardStory = () => {
	const { user } = useAuth()

	// Three of the states are about *your* songs, so they need a guid to compare
	// against — logged out there is nothing to compare and the labels stay off,
	// which is the honest thing for the gallery to show.
	const mine = { createdByGuid: user?.guid }

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				// the gallery's own column wrapper sets nowrap for its ellipsis; a card
				// that cannot wrap is not the card the app renders
				whiteSpace: 'normal',
			}}
		>
			{!user && (
				<Typography small color="grey.600">
					Přihlas se, ať se ukážou i stavy vlastních písní (soukromá, tvoje
					veřejná) a lajk překladu.
				</Typography>
			)}

			<Section title={`Karta — ${CARD_WIDTH} px (desktop, výsledky hledání)`}>
				<Case label="Základní">
					<SongVariantCard data={pack()} />
				</Case>

				<Case label="Pevná výška (flexibleHeight=false)">
					<SongVariantCard data={pack()} flexibleHeight={false} />
				</Case>

				<Case label="Zvýrazněný název">
					<SongVariantCard data={pack()} highlight="zpívat" />
				</Case>

				<Case label="Zvýraznění v textu písně">
					{/* the match is in the refrain, so the preview window has to move
					    off the first verse to find it */}
					<SongVariantCard data={pack()} highlight="cokoli leží" />
				</Case>

				<Case label="Dlouhý řádek se ořízne (nezalamuje se)">
					<SongVariantCard data={pack({ sheetData: LONG_SHEET })} />
				</Case>

				<Case label="Max 4 řádky (řádky s pomlčkou se zlomí, karta neroste)">
					<SongVariantCard data={pack({ sheetData: HYPHEN_SHEET })} />
				</Case>

				<Case label="Vybraná">
					<SongVariantCard data={pack()} selectable selected />
				</Case>

				<Case label="Soukromá">
					<SongVariantCard
						data={pack({ ...mine, public: false })}
						properties={['SHOW_PRIVATE_LABEL']}
					/>
				</Case>

				<Case label="Tvoje veřejná">
					<SongVariantCard
						data={pack(mine)}
						properties={['SHOW_YOUR_PUBLIC_LABEL']}
					/>
				</Case>

				<Case label="Nahráno programem">
					<SongVariantCard
						data={pack({ createdByLoader: true })}
						properties={['SHOW_ADDED_BY_LOADER']}
					/>
				</Case>

				<Case label="S datem přidání">
					<SongVariantCard
						data={pack({ publishedAt: new Date('2024-11-03') })}
						properties={['SHOW_PUBLISHED_DATE']}
					/>
				</Case>

				<Case label="Lajk překladu (palec se ukáže po najetí myší)">
					<SongVariantCard
						data={pack({ translationLikes: 12 })}
						properties={['ENABLE_TRANSLATION_LIKE']}
					/>
				</Case>

				<Case label="Dlouhý název">
					<SongVariantCard
						data={pack({
							title:
								'Chval Ho, ó duše má, a nezapomínej na žádné jeho dobrodiní',
						})}
					/>
				</Case>
			</Section>

			<Section title="Barevný bod u názvu (jazyk × typ překladu)">
				<Case label="Český originál" width={CARD_WIDTH}>
					<SongVariantCard
						data={pack({
							language: 'cs',
							translationType: PackTranslationType.Original,
						})}
						dense
					/>
				</Case>
				<Case label="Český překlad" width={CARD_WIDTH}>
					<SongVariantCard
						data={pack({
							language: 'cs',
							translationType: PackTranslationType.Translation,
						})}
						dense
					/>
				</Case>
				<Case label="Oficiální český překlad" width={CARD_WIDTH}>
					<SongVariantCard
						data={pack({
							language: 'cs',
							translationType: PackTranslationType.OfficialTranslation,
						})}
						dense
					/>
				</Case>
				<Case label="Cizojazyčný originál" width={CARD_WIDTH}>
					<SongVariantCard
						data={pack({
							title: 'Sing Your song',
							language: 'en',
							translationType: PackTranslationType.Original,
						})}
						dense
					/>
				</Case>
				<Case label="Neznámý typ (bez bodu)" width={CARD_WIDTH}>
					<SongVariantCard
						data={pack({ translationType: PackTranslationType.Unknown })}
						dense
					/>
				</Case>
			</Section>

			<Section title={`Řádek — ${ROW_WIDTH} px (telefon, seznamy)`}>
				<Case label="Základní (dense)" width={ROW_WIDTH}>
					<SongVariantCard data={pack()} dense />
				</Case>

				<Case label="S ikonou a šipkou" width={ROW_WIDTH}>
					<SongVariantCard
						data={pack()}
						dense
						leadingIcon={<SongLeadingIcon />}
						trailingIcon={<ChevronRightRounded sx={{ color: 'grey.400' }} />}
					/>
				</Case>

				<Case label="Dva řádky textu (výsledky hledání)" width={ROW_WIDTH}>
					<SongVariantCard
						data={pack()}
						dense
						previewLines={2}
						leadingIcon={<SongLeadingIcon />}
						trailingIcon={<ChevronRightRounded sx={{ color: 'grey.400' }} />}
					/>
				</Case>

				<Case
					label="Zvýraznění s náběhem (řádek se nezalamuje)"
					width={ROW_WIDTH}
				>
					{/* a row clips at its edge, so the preview starts a few characters in
					    front of the match rather than at the start of the line */}
					<SongVariantCard
						data={pack()}
						dense
						previewLines={2}
						highlight="přijde noc"
						leadingIcon={<SongLeadingIcon />}
						trailingIcon={<ChevronRightRounded sx={{ color: 'grey.400' }} />}
					/>
				</Case>

				<Case label="S lajky překladu (sloupec vpravo)" width={ROW_WIDTH}>
					{/* the column a favourite's heart shares: on a row it is centred, so
					    it sits on the same line as the icon and the chevron */}
					<SongVariantCard
						data={pack({ translationLikes: 12 })}
						dense
						previewLines={2}
						properties={['ENABLE_TRANSLATION_LIKE']}
						leadingIcon={<SongLeadingIcon />}
						trailingIcon={<ChevronRightRounded sx={{ color: 'grey.400' }} />}
					/>
				</Case>
			</Section>
		</Box>
	)
}

/* ------------------------------------------------------------------ */

/** The translations a grouped song stands for. */
const translations = (count: number) =>
	[
		pack({ title: 'Zpívat Tvou píseň' }),
		pack({
			title: '10 000 důvodů',
			translationType: PackTranslationType.Translation,
		}),
		pack({
			title: 'Chval Ho, ó duše má',
			translationType: PackTranslationType.OfficialTranslation,
		}),
		pack({
			title: 'Chval ho, ó duše má',
			translationType: PackTranslationType.Translation,
		}),
		pack({
			title: 'Duše má, chval Hospodina',
			translationType: PackTranslationType.Translation,
		}),
	].slice(0, count)

const SongGroupCardStory = () => (
	<Box
		sx={{
			display: 'flex',
			flexDirection: 'column',
			gap: 4,
			whiteSpace: 'normal',
		}}
	>
		<Typography small color="grey.600">
			Jedna píseň s víc překlady. Najeď myší na kartu (nebo klepni na hromádku),
			ať se ukáže volba překladu.
		</Typography>

		<Section title={`Karta — ${CARD_WIDTH} px (desktop)`}>
			<Case label="Bez překladů (sama)">
				<SongGroupCard packs={translations(1)} />
			</Case>
			<Case label="Dva překlady">
				<SongGroupCard packs={translations(2)} />
			</Case>
			<Case label="Pět překladů (stoh se zastaví na čtyřech)">
				<SongGroupCard packs={translations(5)} />
			</Case>
			<Case label="S originálem nad kartou">
				<SongGroupCard
					packs={translations(3)}
					original={pack({ title: '10,000 Reasons (Bless the Lord)' })}
				/>
			</Case>
			<Case label="Se zvýrazněním">
				<SongGroupCard packs={translations(3)} highlight="zpívat" />
			</Case>
		</Section>

		<Section title={`Řádek — ${ROW_WIDTH} px (telefon, výsledky hledání)`}>
			<Case label="Dva překlady (jedna hrana)" width={ROW_WIDTH}>
				<SongGroupCard variant="row" packs={translations(2)} previewLines={2} />
			</Case>
			<Case label="Pět překladů (tři hrany)" width={ROW_WIDTH}>
				<SongGroupCard variant="row" packs={translations(5)} previewLines={2} />
			</Case>
			<Case label="Se zvýrazněním" width={ROW_WIDTH}>
				<SongGroupCard
					variant="row"
					packs={translations(4)}
					previewLines={2}
					highlight="cokoli leží"
				/>
			</Case>
			<Case label="Bez vodicí ikony" width={ROW_WIDTH}>
				<SongGroupCard
					variant="row"
					packs={translations(3)}
					previewLines={2}
					withIcon={false}
				/>
			</Case>
		</Section>
	</Box>
)

// named by hand: SongVariantCard is a memo(), which has no name of its own
createStory('SongVariantCard', SongCardStory)
createStory(SongGroupCard, SongGroupCardStory)
