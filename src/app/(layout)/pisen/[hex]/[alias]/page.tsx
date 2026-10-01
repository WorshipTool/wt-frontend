'use server'
import DragCorner from '@/app/(layout)/pisen/[hex]/[alias]/components/DragCorner'
import SongRightPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/RightPanel/SongRightPanel'
import SongAnalyze from '@/app/(layout)/pisen/[hex]/[alias]/components/SongAnalyze'
import SongContainer from '@/app/(layout)/pisen/[hex]/[alias]/SongContainer'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { DESKTOP_VIEWPORT } from '@/common/components/MobileAppTabBar/nav.constants'
import ContainerGrid from '@/common/components/ContainerGrid'
import { checkFlag } from '@/common/providers/FeatureFlags/flags.tech'
import { Box } from '@/common/ui'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import { VariantPackAlias } from '@/types/song'
import {
	VariantPackGuid,
	mapExtendedVariantPackApiToDto,
	mapGetVariantDataApiToSongDto,
} from '../../../../../api/dtos'
import { SmartParams } from '../../../../../routes'
import { getVariantAliasFromParams, getVariantByAlias } from './tech'

type SongRoutePageProps = {
	params: SmartParams<'variant'>
}

export default SmartPage(SongRoutePage)

async function SongRoutePage({ params }: SongRoutePageProps) {
	const alias = getVariantAliasFromParams(params.hex, params.alias)

	const v = await getVariantByAlias(alias)
	const mainPack = v.main

	const song = mapGetVariantDataApiToSongDto(v)
	const variantData = mapExtendedVariantPackApiToDto(mainPack)

	const showMedia = await checkFlag('show_media_on_song_page')
	return (
		<Box
			sx={{
				display: 'flex',
				// flexDirection: 'row',
				position: 'relative',
			}}
		>
			{/* Just a client analytics */}
			<SongAnalyze data={variantData} />

			<ContainerGrid
				sx={{
					marginTop: 0,
					marginBottom: 0,
					[DESKTOP_VIEWPORT]: { marginTop: 2, marginBottom: 2 },
					gap: 2,
					alignItems: 'start',
				}}
			>
				<Box
					sx={{
						// phone: the collapsing MobileAppHeader (in SongContainer) owns the
						// full-bleed white app-shell + scroll, so this wrapper stays neutral.
						// Above it, the grey "paper" card.
						//
						// The two meet at MOBILE_NAV_BREAKPOINT and must: this card hung on
						// MUI's `md` (900) while the phone shell stops at 700, so a window
						// anywhere between the two showed the song on the bare page — no
						// surface, no padding, the first letter against the left edge.
						// no global border-box reset in the app — without this the
						// padding would push the surface past the viewport
						boxSizing: 'border-box',
						padding: 0,
						backgroundColor: 'transparent',
						borderStyle: 'solid',
						borderWidth: 0,
						borderColor: 'grey.300',
						boxShadow: 'none',
						borderRadius: 0,
						[DESKTOP_VIEWPORT]: {
							padding: 3,
							backgroundColor: 'grey.200',
							borderWidth: 1,
							boxShadow: '0px 2px 3px 1px rgba(0, 0, 0, 0.1)',
							borderRadius: 1,
						},
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						displayPrint: 'none',
						position: 'relative',
					}}
				>
					{Array.from({ length: 4 }).map((_, i) => (
						<DraggableSong
							key={i}
							data={{
								packGuid: variantData?.packGuid || ('' as VariantPackGuid),
								title: variantData?.title || '',
								alias: variantData?.packAlias || ('' as VariantPackAlias),
							}}
						>
							<DragCorner index={i} />
						</DraggableSong>
					))}

					<SongContainer
						variant={variantData}
						song={song}
						flags={{
							showMedia: showMedia,
						}}
					/>
				</Box>

				<SongRightPanel pack={variantData} song={song} />
			</ContainerGrid>
		</Box>
	)
}
