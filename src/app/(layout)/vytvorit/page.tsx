'use client'
import CreateOptionItem from '@/app/(layout)/vytvorit/components/CreateOptionItem'
import { CREATE_OPTIONS } from '@/app/(layout)/vytvorit/components/createOptions'
import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import FlagProtected from '@/common/providers/FeatureFlags/FlagProtected'
import { Box } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'

export default SmartPage(AddMenu)

function AddMenu() {
	const t = useTranslations('upload')

	const phoneVersion = useIsPhone()

	// The options are one responsive component (row on phones, card on desktop),
	// so only the surrounding shell differs — this is the page's single branch.
	const options = CREATE_OPTIONS.map((option) => {
		const item = <CreateOptionItem option={option} />
		return (
			<Fragment key={option.to}>
				{'flag' in option ? (
					<FlagProtected flag={option.flag}>{item}</FlagProtected>
				) : (
					item
				)}
			</Fragment>
		)
	})

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
