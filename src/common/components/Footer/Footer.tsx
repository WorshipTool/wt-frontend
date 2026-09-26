import { useFooter } from '@/common/components/Footer/hooks/useFooter'
import { Box } from '@/common/ui'
import { Button, ButtonProps } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { Favorite } from '@mui/icons-material'

import { useCloudNumber } from '@/common/providers/FeatureFlags/useCloudNumber'
import { Gap } from '@/common/ui/Gap'
import { Link } from '@/common/ui/Link/Link'
import { getStripeSupportUrl } from '@/common/utils/getStripeSupportUrl'
import { RoutesKeys } from '@/routes'
import { getAssetUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useMemo } from 'react'
import './footer.styles.css'

type Links = [
	ButtonProps<'songsList'>,
	ButtonProps<'songsList'>,
	ButtonProps<'about'>,
	ButtonProps<'teams'>,
	ButtonProps<'contact'>,
	ButtonProps<'contact'>,
	ButtonProps<RoutesKeys>,
	ButtonProps<'contact'>
]
export default function Footer() {
	const tFooter = useTranslations('footer')

	const year = useCloudNumber('year', 2024)

	const links: Links = useMemo(
		() => [
			// The catalog, twice over: with its field asking for the caret, and
			// plain to browse. Searching used to be a mode of home, so these two
			// pointed at different screens.
			{
				children: tFooter('links.searchSong'),
				to: 'songsList',
				toParams: { hledat: '', s: undefined },
			},
			{
				children: tFooter('links.songList'),
				to: 'songsList',
				toParams: { hledat: undefined, s: undefined },
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
		[tFooter]
	)

	const footer = useFooter()

	return (
		<footer className={footer.show ? 'footer footer-open ' : 'footer'}>
			<Box
				sx={{
					bgcolor: 'grey.200',
					borderTop: '2px solid',
					borderColor: 'grey.300',
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
						// bgcolor={'grey.300'}
						sx={{
							borderRadius: 5,
							paddingX: 2,
							// border: '1px solid',
							borderColor: 'grey.400',
							paddingY: 0.5,
						}}
					>
						<Typography small color="grey.500">
							{tFooter('cooperation')}
						</Typography>
						<Image
							src={getAssetUrl('worshipko.webp')}
							alt={tFooter('logoAlt')}
							width={150}
							height={30}
							style={{
								objectFit: 'contain',
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
								color="grey.500"
								variant="text"
								sx={{
									fontWeight: 400,
								}}
								{...link}
							/>
						)
					})}
				</Box>
				<Gap value={0.5} />

				<Box display={'flex'} flexDirection={'row'} gap={1}>
					<Typography strong size={'small'}>
						{tFooter('createdWith')}{' '}
						<Favorite
							color={'error'}
							sx={{
								fontSize: '0.9rem',
								transform: 'translateY(0.15rem)',
							}}
						/>
					</Typography>
					<Typography size={'small'}>{year}</Typography>
					<Typography size={'small'}>{tFooter('rightsReserved')}</Typography>
				</Box>
				<Gap value={2} />
			</Box>
		</footer>
	)
}
