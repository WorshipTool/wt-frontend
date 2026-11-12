'use client'
import CreateOptionItem from '@/app/(layout)/vytvorit/components/CreateOptionItem'
import { CREATE_OPTIONS } from '@/app/(layout)/vytvorit/components/createOptions'
import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import ParserCreateTiles from '@/app/(layout)/vytvorit/components/ParserCreateTiles'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import useAuth from '@/hooks/auth/useAuth'
import { Box } from '@/common/ui'
import { useTranslations } from 'next-intl'

export default SmartPage(AddMenu)

function AddMenu() {
	const t = useTranslations('upload')

	const phoneVersion = useIsPhone()

	// The general parser replaces the create menu with three tiles. Signed-out
	// users get the plain write-manually option: the parser endpoint is for
	// signed-in users only.
	const { isLoggedIn } = useAuth()
	const parserTiles = useFlag('enable_general_parser') && isLoggedIn()

	// The options are one responsive component (row on phones, card on desktop),
	// so only the surrounding shell differs — this is the page's single branch.
	const options = parserTiles ? (
		<ParserCreateTiles />
	) : (
		CREATE_OPTIONS.map((option) => (
			<CreateOptionItem key={option.to} option={option} />
		))
	)

	if (phoneVersion) {
		return (
			<MobileAppHeader title={t('addTitle')} backTo="usersSongs">
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 1.5,
						paddingTop: 1,
					}}
				>
					{options}
					<ParseAdminOption />
				</Box>
			</MobileAppHeader>
		)
	}

	return (
		<>
			<Box
				sx={{
					width: '100%',
					height: 500,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						flexWrap: 'wrap',
						gap: 5,
					}}
				>
					{options}
				</Box>
			</Box>

			<ParseAdminOption />
		</>
	)
}
