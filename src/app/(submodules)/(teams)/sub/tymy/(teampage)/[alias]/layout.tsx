'use server'
import { getImageUrl } from '@/api/urls'
import TeamPageProviders from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/Providers/TeamPageProviders'
import TeamLoadingProvider from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamLoadingProvider/TeamLoadingProvider'
import TeamClientLayout from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/TeamClientLayout'
import TeamClientProviders from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/TeamClientProviders'
import { InnerTeamProvider } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import {
	checkLayoutUserMembership,
	getLayoutTeamInfo,
	getLayoutTeamPayload,
} from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/tech/layout.tech'
import { LayoutProps } from '@/common/types'
import { Box } from '@/common/ui'
import { useServerPathname } from '@/hooks/pathname/useServerPathname'
import { smartRedirect } from '@/routes/routes.tech.server'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { notFound } from 'next/navigation'

export const generateMetadata = generateSmartMetadata(
	'team',
	async ({ params }) => {
		const info = await getLayoutTeamInfo(params.alias)
		const teamName = info?.name

		const title = info ? `Tým ${teamName}` : 'Tým'
		const imageUrl = info?.logoGuid ? getImageUrl(info.logoGuid) : null

		return {
			title,

			...(imageUrl
				? {
						icons: {
							icon: imageUrl,
						},
				  }
				: {}),
		}
	}
)

export default async function TeamLayout(layout: LayoutProps<'team'>) {
	const pathname = await useServerPathname()
	const info = await getLayoutTeamInfo(layout.params.alias)
	if (!info) notFound()

	const payload = await getLayoutTeamPayload(info.guid)

	const membershipCheck = await checkLayoutUserMembership(info.alias)
	if (!membershipCheck) {
		const isPlaylistPath = pathname.includes('/playlist/')
		if (isPlaylistPath) {
			smartRedirect('teamNoAccess', { alias: info.alias })
		} else if (payload.showSongbookForNotMembers) {
			smartRedirect('teamPublic', { alias: info.alias })
		} else if (membershipCheck === null) {
			smartRedirect('login', {
				previousPage: pathname,
				message: 'Pro vstup do týmu se musíte přihlásit',
			})
		} else {
			smartRedirect('teamNoAccess', { alias: info.alias })
		}
	}

	return (
		<Box height={'100vh'} position={'relative'}>
			<InnerTeamProvider teamAlias={layout.params.alias}>
				<TeamLoadingProvider>
					<TeamClientProviders>
						<TeamPageProviders>
							<TeamClientLayout>{layout.children}</TeamClientLayout>
						</TeamPageProviders>
					</TeamClientProviders>
				</TeamLoadingProvider>
			</InnerTeamProvider>
		</Box>
	)
}
