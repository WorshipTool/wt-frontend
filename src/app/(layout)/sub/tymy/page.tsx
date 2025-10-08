'use server'
import SectionLabelPill from '@/app/(layout)/o-nas/components/SectionLabelPill'
import CreateTeamButton from '@/app/(layout)/sub/tymy/components/CreateTeamButton'
import TeamsToolbarChanger from '@/app/(layout)/sub/tymy/components/ToolbarChanger'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, Image } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { getAssetUrl } from '@/tech/paths.tech'
import { getTranslations } from 'next-intl/server'
import JoinGroupPanel from './components/JoinGroupPanel'
import './teams.styles.css'

export default SmartPage(Page, {
	transparentToolbar: true,
})

async function Page() {
	const t = await getTranslations('teams')

	return (
		<Box position={'relative'}>
			<TeamsToolbarChanger />
			<Gap value={2} />
			<JoinGroupPanel />
			<Gap value={4} />
			<Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'}>
				<Box display={'flex'} flexDirection={'column'} gap={4}>
					<Box display={'flex'} flexDirection={'column'} gap={1}>
						<Box display={'flex'}>
							<SectionLabelPill label={t('title')} />
						</Box>
						<Box display={'flex'} flexDirection={'column'}>
							<Typography strong className="about-title" variant="h1">
								{t('simplifyWork')}
							</Typography>
							<Typography className="about-title" variant="h1">
								{t('inYourWorshipTeam')}
							</Typography>
						</Box>
					</Box>
					<Typography
						sx={{
							width: 400,
						}}
						variant="h3"
						strong={400}
						color="grey.500"
					>
						{t('freeToolsDescription')}
					</Typography>
				</Box>
				<Box
					flex={1}
					display={'flex'}
					flexDirection={'column'}
					justifyContent={'center'}
					alignItems={'center'}
					position={'relative'}
				>
					<Gap value={4} />
					<Box
						sx={{
							position: 'absolute',
						}}
					>
						<Image
							src={'/assets/gradient-shapes/shape1.svg'}
							alt={t('backgroundShape')}
							width={500}
							height={500}
						/>
					</Box>
					<Box
						sx={{
							position: 'absolute',
						}}
					>
						<Image
							src={'/assets/gradient-shapes/shape2.svg'}
							alt={t('backgroundShape')}
							width={500}
							height={500}
							style={{
								transform: 'rotate(180deg) translate(0, 0px) scale(1.0)',
							}}
						/>
					</Box>
					<Box
						display={'flex'}
						flexDirection={'column'}
						justifyContent={'center'}
						alignItems={'center'}
						width={'100%'}
					>
						<Box
							// maxWidth={450 * 1.2}
							minWidth={400}
							width={'70%'}
							sx={{
								aspectRatio: '8 / 5',
								zIndex: 1,

								'&: hover': {
									transform: 'scale(1.7)',
									bgcolor: 'rgba(0,0,0,0)',
								},
								transition: 'all 1s',
							}}
							position={'relative'}
						>
							<Image
								src={getAssetUrl('team-preview.png')}
								alt={t('teamScreenPreview')}
								fill
								priority
							/>
						</Box>
						<Box marginBottom={4}>
							<CreateTeamButton />
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
