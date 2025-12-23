import { BACKEND_URL } from '@/api/constants'
import { ImagesApiAxiosParamCreator } from '@/api/generated'
import { useTeamChecker } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { CommonLinkProps } from '@/common/ui/Link/Link'
import { SxProps } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import { RoutesKeys } from '@/routes'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { isDevelopment } from '@/tech/development.tech'
import { getIconUrl } from '@/tech/paths.tech'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import useUserTeams from '../../../../../../../app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useUserTeams'

export type MenuItemProps<T extends RoutesKeys> = {
	title: string
	image: string
	asyncImage?: () => Promise<string>
	action?: () => void
	to?: CommonLinkProps<T>['to']
	toParams?: CommonLinkProps<T>['params']
	disabled?: boolean
	hidden?: boolean
	sx?: SxProps
	imageSizeCoef?: number
}

export const searchGroupsEvent = new Event('searchGroups')

export default function useToolsMenuItems() {
	const navigate = useSmartNavigate()

	const { isAdmin } = useAuth()
	const tNavigation = useTranslations('navigation')

	const { teams } = useUserTeams()
	const isTeamOn = useTeamChecker()

	const showAdminPage = useFlag('show_admin_page')

	const imagesApi = ImagesApiAxiosParamCreator({
		isJsonMime: () => true,
	})

	const teamsItems: MenuItemProps<any>[] = useMemo(() => {
		if (!teams) return []
		return teams.map((team) => {
			const hasLogo = team.logoGuid !== null

			return {
				title: team.name,
				image: getIconUrl('team-default.webp'),
				asyncImage: hasLogo
					? async () => {
							// console.log('getting logo in tool item')
							const url =
								BACKEND_URL + (await imagesApi.getImage(team.logoGuid!)).url
							return url
					  }
					: undefined,
				to: 'team',
				toParams: {
					alias: team.alias,
				},
			}
		})
	}, [teams])

	const items: MenuItemProps<any>[] = useMemo(() => {
		return [
			{
				title: tNavigation('toolsMenu.playlists'),
				image: getIconUrl('playlists.png'),
				to: 'usersPlaylists',
			},
			{
				title: tNavigation('toolsMenu.mySongs'),
				image: getIconUrl('users_song_list.png'),
				to: 'usersSongs',
			},
			{
				title: tNavigation('toolsMenu.favourites'),
				image: getIconUrl('favourites-songs.png'),
				to: 'usersFavourites',
			},

			{
				title: tNavigation('toolsMenu.outsideTeam'),
				image: getIconUrl('home.png'),
				to: 'home',
				hidden: !isTeamOn,
			},
			{
				title: 'Admin',
				to: 'admin',
				image: getIconUrl('admin.png'),
				hidden: !showAdminPage,
				imageSizeCoef: 0.8,
			},
			{
				title: 'ML Trénink',
				to: 'adminMlTraining',
				image: getIconUrl('ai-song.png'),
				hidden: !showAdminPage,
				imageSizeCoef: 0.8,
			},

			...(isDevelopment
				? [
						{
							title: 'Test',
							image: getIconUrl('test.png'),
							to: 'test',
							hidden: !isAdmin(),
						},
						{
							title: 'Components',
							image: getIconUrl('components.png'),
							to: 'testComponents',
							hidden: !isAdmin(),
						},
				  ]
				: []),
			...teamsItems,
		]
	}, [isAdmin, isTeamOn, showAdminPage, tNavigation, teamsItems])

	return {
		items,
	}
}
