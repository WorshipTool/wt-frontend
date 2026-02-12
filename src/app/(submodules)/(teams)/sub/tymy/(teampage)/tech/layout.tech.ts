import {
	IsUserMemberOfTeamOutDto,
	TeamGettingApi,
	TeamMembersApiAxiosParamCreator,
} from '@/api/generated'
import { BASE_PATH } from '@/api/generated/base'
import {
	TeamPayload,
	teamPayloadDefaults,
} from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/payload/tech'
import { AUTH_COOKIE_NAME } from '@/hooks/auth/auth.constants'
import { UserDto } from '@/interfaces/user'
import { handleApiCall } from '@/tech/fetch/handleApiCall'
import { cookies } from 'next/headers'

//TODO: dont create api instance, use useApi() hook instead
export const getLayoutTeamInfo = async (teamAlias: string) => {
	const gettingApi = new TeamGettingApi()
	try {
		const team = await handleApiCall(gettingApi.getTeamBasicInfo(teamAlias))
		return team
	} catch (e: any) {
		return null
	}
}

export const getLayoutTeamPayload = async (
	teamGuid: string
): Promise<TeamPayload> => {
	const gettingApi = new TeamGettingApi()
	try {
		const payloadString = await handleApiCall(
			gettingApi.getTeamPayload(teamGuid)
		)

		const data =
			typeof payloadString !== 'object'
				? JSON.parse(payloadString)
				: payloadString
		const payload: TeamPayload = {
			...teamPayloadDefaults,
			...data,
		}

		return payload
	} catch (e: any) {
		return teamPayloadDefaults
	}
}

export const checkLayoutUserMembership = async (
	teamAlias: string
): Promise<boolean | null> => {
	const cookie = await cookies()
	const cookieData = cookie.get(AUTH_COOKIE_NAME)
	const user: UserDto | undefined = cookieData
		? JSON.parse(cookieData.value)
		: undefined

	if (!user) {
		return null
	}

	const creator = TeamMembersApiAxiosParamCreator({
		isJsonMime: () => true,
		accessToken: user.token,
	})

	try {
		const fetchData = await creator.isUserMemberOfTeam(teamAlias)
		const url = BASE_PATH + fetchData.url
		const result = await fetch(url, { ...(fetchData.options as any) })

		const data: IsUserMemberOfTeamOutDto = await result.json()

		if (data.isMember) {
			return true
		}
	} catch (e) {}

	return false
}
