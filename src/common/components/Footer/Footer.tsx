import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { Box } from '@/common/ui'
import { Button, ButtonProps } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { Favorite } from '@mui/icons-material'

import { MAIN_SEARCH_EVENT_NAME } from '@/app/components/components/MainSearchInput'
import { useCloudNumber } from '@/common/providers/FeatureFlags/useCloudNumber'
import { Gap } from '@/common/ui/Gap'
import { Link } from '@/common/ui/Link/Link'
import { getStripeSupportUrl } from '@/common/utils/getStripeSupportUrl'
import { RoutesKeys } from '@/routes'
import { useSmartMatch } from '@/routes/useSmartMatch'
import { useSmartParams } from '@/routes/useSmartParams'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useMemo } from 'react'
import './footer.styles.css'

type Links = [
	ButtonProps<'home'>,
	ButtonProps<'songsList'>,
	ButtonProps<'about'>,
	ButtonProps<'teams'>,
	ButtonProps<'contact'>,
	ButtonProps<'contact'>,
	ButtonProps<RoutesKeys>,
	ButtonProps<'contact'>
]
export default function Footer() {
	const { hledat: searchString } = useSmartParams('home')
	const isHome = useSmartMatch('home')
	const tFooter = useTranslations('footer')

	const year = useCloudNumber('year', 2024)

	const links: Links = useMemo(
		() => [
			{
				children: tFooter('links.searchSong'),
				to: 'home',
				toParams: { hledat: isHome ? searchString : '' },
				onClick: () => {
					window.dispatchEvent(new Event(MAIN_SEARCH_EVENT_NAME))
				},
			},
			{
				children: tFooter('links.songList'),
				to: 'songsList',
			},
			{
				children: tFooter('links.about'),
				to: 'about',
			},
			{
				children: tFooter('links.teams'),
				to: 'teams',
			},
			{
				children: tFooter('links.feedback'),
				to: 'contact',
			},
			{
				children: tFooter('links.reportBug'),
				to: 'contact',
			},
			{
				children: 'Podpořit',
				external: true,
				href: getStripeSupportUrl(),
			},
			{
				children: tFooter('links.contact'),
				to: 'contact',
			},
		],
		[isHome, searchString, tFooter]
	)

	const footer = useFooter()

	return (
		<footer className={footer.show ? 'footer footer-open ' : 'footer'}>
			<Box
				sx={{
					background: 'linear-gradient(180deg, rgba(10, 10, 15, 0.95), rgba(14, 14, 26, 0.98))',
					borderTop: '1px solid rgba(0, 229, 255, 0.15)',
					boxShadow: '0 -2px 20px rgba(0, 229, 255, 0.06)',
					marginTop: 1,
					padding: 1,
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'column',
					height: '100%',
				}}
			>
				<Gap value={1} />
				<Link href={'https://worshipko.com' as any} target="_blank" external>
					<Box
						display={'flex'}
						flexDirection={'row'}
						gap={1}
						alignItems={'center'}
						sx={{
							borderRadius: '4px',
							paddingX: 2,
							border: '1px solid rgba(0, 229, 255, 0.1)',
							paddingY: 0.5,
							transition: 'all 0.3s ease',
							'&:hover': {
								borderColor: 'rgba(0, 229, 255, 0.3)',
								boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)',
							},
						}}
					>
						<Typography small color="#8888aa">
							{tFooter('cooperation')}
						</Typography>
						<Image
							src={getAssetUrl('worshipko.webp')}
							alt={tFooter('logoAlt')}
							width={150}
							height={30}
							style={{
								objectFit: 'contain',
								filter: 'brightness(0.8) hue-rotate(180deg)',
							}}
							priority
						/>
					</Box>
				</Link>
				<Gap value={1} />
				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={{
						sm: 0,
						md: 1,
					}}
					flexWrap={'wrap'}
					justifyContent={'center'}
				>
					{links.map((link) => {
						return (
							<Button
								size={'small'}
								key={link.children as string}
								color="grey.600"
								variant="text"
								sx={{
									fontWeight: 400,
									fontFamily: 'var(--font-jetbrains), monospace',
									letterSpacing: '0.03em',
									transition: 'all 0.2s ease',
									'&:hover': {
										color: '#00e5ff',
										textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
									},
								}}
								{...link}
							/>
						)
					})}
				</Box>
				<Gap value={0.5} />

				<Box display={'flex'} flexDirection={'row'} gap={1}>
					<Typography strong size={'small'} sx={{ color: '#8888aa' }}>
						{tFooter('createdWith')}{' '}
						<Favorite
							sx={{
								fontSize: '0.9rem',
								transform: 'translateY(0.15rem)',
								color: '#ff00e5',
								filter: 'drop-shadow(0 0 4px rgba(255, 0, 229, 0.5))',
							}}
						/>
					</Typography>
					<Typography size={'small'} sx={{ color: '#4a4a6a' }}>{year}</Typography>
					<Typography size={'small'} sx={{ color: '#4a4a6a' }}>{tFooter('rightsReserved')}</Typography>
				</Box>
				<Gap value={2} />
			</Box>
		</footer>
	)
}
