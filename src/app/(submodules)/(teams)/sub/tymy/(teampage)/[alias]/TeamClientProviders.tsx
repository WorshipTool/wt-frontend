'use client'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import AppSongSelectSpecifierProvider from '@/app/components/components/AppSongSelectSpecifierProvider'
import OutsideLinkBlocker from '@/common/ui/Link/OutsideLinkBlocker'
import { routesPaths, SmartAllParams } from '@/routes'
import { urlMatchPatterns } from '@/routes/tech/routes.tech'
import { useTranslations } from 'next-intl'
import React from 'react'

type Props = {
	children: React.ReactNode
}
export default function TeamClientProviders(props: Props) {
	const { alias } = useInnerTeam()
	const t = useTranslations('teams.providers')
	
	return (
		<AppSongSelectSpecifierProvider teamsOptionLabel={t('songSelect.teamsOption')}>
			<OutsideLinkBlocker
				condition={({ url, params: p }) => {
					const isTeam = urlMatchPatterns(url, routesPaths.team, true)

					const isLoginPage = urlMatchPatterns(url, routesPaths.login, true)

					if (isLoginPage) return false

					// Block everything outside the team
					if (!isTeam) return true

					const params: SmartAllParams<'team'> = p
					const teamAlias = params.alias

					if (teamAlias !== alias) return true

					return false
				}}
				popupTitle={t('outsideLinkBlocker.title')}
				popupMessage={t('outsideLinkBlocker.message')}
			>
				{props.children}
			</OutsideLinkBlocker>
		</AppSongSelectSpecifierProvider>
	)
}
