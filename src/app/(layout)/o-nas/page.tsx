'use client'
import SectionLabelPill from '@/app/(layout)/o-nas/components/SectionLabelPill'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { useTranslations } from 'next-intl'

import Image from 'next/image'

import AboutInfoDatabase from '@/app/(layout)/o-nas/components/AboutInfoCard'
import AboutToolCard from '@/app/(layout)/o-nas/components/AboutToolCard'
import More from '@/app/(layout)/o-nas/components/More/More'
import MoreButton from '@/app/(layout)/o-nas/components/More/MoreButton'
import ToolbarChanger from '@/app/(layout)/o-nas/components/ToolbarChanger'
import { Video } from '@/common/components/Video/Video'
import { Button } from '@/common/ui/Button'
import { Groups2, LibraryMusic, SmartButton } from '@mui/icons-material'
import Shape from './shape.svg'
import Shape2 from './shape2.svg'

//TODO: fix overflow in better way.
import CollaborationWithWorshipkoCard from '@/app/(layout)/o-nas/components/CollaborationWithWorshipkoCard'
import HelpUsPanel from '@/app/(layout)/o-nas/components/HelpUsPanel'
import SheepBigGraphics from '@/app/(layout)/o-nas/components/SheepBigGraphics'
import { Divider } from '@/common/ui'
import { getStripeSupportUrl } from '@/common/utils/getStripeSupportUrl'
import breakpoints from '@/tech/theme/theme.tech'
import './styles.css'

export default SmartPage(Page, ['transparentToolbar', 'containLayout'])

function Page() {
	const t = useTranslations('about')
	const stripeUrl = getStripeSupportUrl()
	return (
		<Box>
			<ToolbarChanger />

			{/* FIRST PAGE - Introduction */}
			<Box
				height={'calc(100vh - 56px)'}
				position={'relative'}
				display={'flex'}
				flexDirection={'column'}
				justifyContent={'center'}
			>
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={3}
					sx={{
						paddingLeft: { xs: 0, lg: 10 },
					}}
				>
					<Box display={'flex'} flexDirection={'column'} gap={1}>
						<Box display={'flex'}>
							<SectionLabelPill label={t('whoAreWe')} />
						</Box>
						<Box display={'flex'} flexDirection={'column'}>
							<Typography className="about-title" variant="h1" strong={600}>
								{t('platform')}
							</Typography>
							<Typography className="about-title" variant="h1">
								{t('withChristianPraises')}
							</Typography>
							<Typography className="about-title" variant="h1">
								{t('praises')}
							</Typography>
						</Box>
					</Box>
					<Typography
						sx={{
							maxWidth: 410,
						}}
						// strong={400}
						color="grey.500"
						variant="h3"
					>
						{t('description')}
					</Typography>
					<Box display={'flex'}>
						<MoreButton />
					</Box>
				</Box>
				<Gap value={8} />

				<Box>
					<Box
						sx={{
							position: 'absolute',
							top: -300,
							left: '55%',
							transform: 'scale(0.8) scaleX(1.2)',
						}}
					>
						<Shape2 />
					</Box>
					<Box
						sx={{
							position: 'absolute',
							top: -500,
							left: '65%',
							transform: 'scale(0.8) scaleX(1.2)',
						}}
					>
						<Shape />
					</Box>
				</Box>
				<Box
					sx={{
						position: 'absolute',
						bottom: 0,
						right: '25%',
						zIndex: 1,
						width: 'clamp(0px,25%, 180px)',
						aspectRatio: '1/2',
						transform: 'translateX(50%)',
					}}
				>
					<Image
						src={'/assets/sheeps/ovce1.svg'}
						alt={t('graphics.introSheepAlt')}
						fill
						style={{
							transform: 'translateY(15%)',
						}}
					/>
				</Box>

				<Box
					sx={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: 55,
					}}
				>
					<More />
				</Box>
			</Box>

			{/* <Divider /> */}
			{/* <Gap /> */}
			<CollaborationWithWorshipkoCard />
			{/* SECOND PAGE - Database */}
			<Box
				paddingY={8}
				position={'relative'}
				display={'flex'}
				flexDirection={'row'}
				gap={3}
				flexWrap={'wrap'}
			>
				<Box
					display={'flex'}
					flexDirection={'column'}
					gap={4}
					flex={1}
					minWidth={300}
				>
					<Box display={'flex'} flexDirection={'column'} gap={1}>
						<Typography variant="h2">{t('database.title')}</Typography>

						<Typography
							variant="h4"
							sx={{
								maxWidth: 450,
							}}
							color="grey.500"
						>
							{t('database.description')}
						</Typography>
					</Box>
					<Box
						flex={1}
						display={{
							xs: 'none',

							sm: 'flex',
						}}
						justifyContent={'center'}
						sx={{
							[breakpoints.up('lg')]: {
								transform: 'translateX(-64px) ',
							},
						}}
					>
						<SheepBigGraphics />
					</Box>
				</Box>
				<Box
					flex={1}
					display={'flex'}
					flexDirection={'column'}
					gap={4}
					minWidth={350}
					sx={{
						alignItems: 'center',
						[breakpoints.up('lg')]: {
							alignItems: 'end',
						},
					}}
					// bgcolor={'grey.500'}
				>
					<Box
						sx={{
							[breakpoints.up('lg')]: {
								transform: 'translateX(-128px) translateY(32px)',
							},
						}}
					>
						<AboutInfoDatabase
							order={0}
							title={t('database.allInOne.title')}
							text={t('database.allInOne.description')}
						/>
					</Box>
					<Box
						sx={{
							[breakpoints.up('lg')]: {
								transform: 'translateX(0%) translateY(32px)',
							},
						}}
					>
						<AboutInfoDatabase
							order={1}
							title={t('database.constantUpdate.title')}
							text={t('database.constantUpdate.description')}
						/>
					</Box>
					<Box
						sx={{
							[breakpoints.up('lg')]: {
								transform: `translateX(-100%) translateX(-32px) translateY(-32px)`,
							},
						}}
					>
						<AboutInfoDatabase
							order={2}
							title={t('database.yourSongs.title')}
							text={t('database.yourSongs.description')}
						/>
					</Box>
				</Box>
			</Box>

			{/* <Divider /> */}
			<Divider />

			{/* THIRD PAGE - Tools */}
			<Box paddingX={4} paddingY={6} position={'relative'}>
				<Box
					display={'flex'}
					flexDirection={'column'}
					alignItems={'center'}
					gap={1}
				>
					<Typography variant="h2">{t('tools.title')}</Typography>
					<Typography variant="h4" color="grey.600" align="center">
						{t('tools.description')}
					</Typography>
				</Box>

				<Gap value={2} />
				<Box display={'flex'} flexDirection={'row'} gap={2} flexWrap={'wrap'}>
					<AboutToolCard
						title={t('tools.smartSearch.title')}
						text={t('tools.smartSearch.description')}
						icon={<SmartButton />}
						button={
							<Button size="small" variant="outlined" to="home">
								{t('tools.smartSearch.tryIt')}
							</Button>
						}
					/>
					<AboutToolCard
						title={t('tools.teams.title')}
						text={t('tools.teams.description')}
						icon={<Groups2 />}
						button={
							<Button
								variant="contained"
								size="small"
								color="primarygradient"
								to="teams"
							>
								{t('tools.teams.learnMore')}
							</Button>
						}
					/>

					<AboutToolCard
						title={t('tools.playlists.title')}
						text={t('tools.playlists.description')}
						icon={<LibraryMusic />}
						button={
							<Button size="small" variant="outlined" to="usersPlaylists">
								{t('tools.playlists.tryIt')}
							</Button>
						}
					/>
				</Box>
			</Box>

			<Divider />
			{/* FOURTH PAGE - Video */}

			<Box paddingY={8} position={'relative'} display={'none'}>
				<Box display={'flex'} flexDirection={'row'} gap={2} flexWrap={'wrap'}>
					<Box display={'flex'} flexDirection={'column'} flex={2} gap={1}>
						<Typography variant="h2" noWrap>
							{t('whyWhoHow.title')}
						</Typography>
						<Typography variant="h4" color="grey.600">
							{t('whyWhoHow.description')}
						</Typography>
					</Box>
					<Video
						src="/assets/videos/example2.mp4"
						style={{
							flex: 3,
							minWidth: 300,
						}}
					/>
				</Box>
			</Box>

			<Divider />
			{/* FIFTH PAGE - Help us */}
			<Box
				paddingY={8}
				position={'relative'}
				display={'flex'}
				flexDirection={'row'}
				gap={4}
				flexWrap={'wrap'}
			>
				<HelpUsPanel />
				{
					<Box
						display={'flex'}
						flexDirection={'column'}
						alignItems={'center'}
						gap={2}
						flexWrap={'wrap'}
						bgcolor={'grey.300'}
						boxShadow={'0px 2px 4px  rgba(0,0,0,0.2)'}
						padding={4}
						borderRadius={4}
						flex={1}
					>
						<Box
							display={'flex'}
							flexDirection={'column'}
							alignItems={'center'}
						>
							<Box
								display={'flex'}
								flexDirection={'row'}
								alignItems={'center'}
								gap={1}
							>
								<Image
									src={'/assets/icons/send-money.svg'}
									alt={t('supportCard.iconAlt')}
									width={40}
									height={40}
								/>
								<Typography variant="h2" noWrap>
									{t('supportCard.title')}
								</Typography>
							</Box>
							<Typography variant="h4" color="grey.600" align="center">
								{t('supportCard.description')}
							</Typography>
						</Box>
						<Box display={'flex'}>
							<Button color={'secondary'} href={stripeUrl}>
								{t('supportCard.button')}
							</Button>
						</Box>
					</Box>
				}
			</Box>
		</Box>
	)
}
