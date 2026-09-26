'use server'
import DragCorner from '@/app/(layout)/pisen/[hex]/[alias]/components/DragCorner'
import SongRightPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/RightPanel/SongRightPanel'
import SongAnalyze from '@/app/(layout)/pisen/[hex]/[alias]/components/SongAnalyze'
import SongContainer from '@/app/(layout)/pisen/[hex]/[alias]/SongContainer'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
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
					marginTop: { xs: 0, md: 2 },
					marginBottom: { xs: 0, md: 2 },
					// paddingX: 6,
					gap: 2,
					alignItems: 'start',
				}}
			>
				<Box
					sx={{
						// phone: the collapsing MobileAppHeader (in SongContainer) owns the
						// full-bleed white app-shell + scroll, so this wrapper stays neutral;
						// desktop (md+): the original grey "paper" card
						width: { xs: 'auto', md: 'auto' },
						minWidth: { xs: 0, md: 0 },
						marginLeft: { xs: 0, md: 0 },
						// no global border-box reset in the app — without this the
						// padding would push the surface past the viewport
						boxSizing: 'border-box',
						padding: { xs: 0, md: 3 },
						paddingBottom: { xs: 0, md: 3 },
						backgroundColor: { xs: 'transparent', md: 'grey.200' },
						borderStyle: 'solid',
						borderWidth: { xs: 0, md: 1 },
						borderColor: 'grey.300',
						boxShadow: {
							xs: 'none',
							md: '0px 2px 3px 1px rgba(0, 0, 0, 0.1)',
						},
						borderRadius: { xs: 0, md: 1 },
						minHeight: { xs: 'auto', md: 'auto' },
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
