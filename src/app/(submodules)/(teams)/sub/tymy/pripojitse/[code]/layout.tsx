'use server'
import {
	JoinTeamOutDto,
	TeamJoiningApiAxiosParamCreator,
} from '@/api/generated'
import { BASE_PATH } from '@/api/generated/base'
import { decodeTeamCode } from '@/app/(submodules)/(teams)/sub/tymy/pripojitse/[code]/tech'
import { LayoutProps } from '@/common/types'
import { Box } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { AUTH_COOKIE_NAME } from '@/hooks/auth/auth.constants'
import { useServerPathname } from '@/hooks/pathname/useServerPathname'
import { UserDto } from '@/interfaces/user'
import { smartRedirect } from '@/routes/routes.tech.server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

const joinTeam = async (code: string) => {
	const cookie = await cookies()
	const cookieData = cookie.get(AUTH_COOKIE_NAME)
	const user: UserDto | undefined = cookieData
		? JSON.parse(cookieData.value)
		: undefined

	const creator = TeamJoiningApiAxiosParamCreator({
		isJsonMime: () => true,
		accessToken: user?.token,
	})

	const fetchData = await creator.joinTeam({
		joinCode: code,
	})
	const url = BASE_PATH + fetchData.url
	const result = await fetch(url, {
		...(fetchData.options as any),
		body: fetchData.options.data,
	})

	const data: JoinTeamOutDto = await result.json()
	return data
}

export default async function PripojitSePage(props: LayoutProps<'teamJoin'>) {
	const pathname = await useServerPathname()
	const params = await props.params
	const coded_code = params.code
	const code = decodeTeamCode(coded_code)

	const data = await joinTeam(code)
	if (!data) notFound()
	if ((data as any).statusCode === 401) {
		smartRedirect('login', {
			previousPage: pathname,
			message: 'Pro připojení k týmu se musíš přihlásit',
		})
	}
	if ((data as any).statusCode >= 400) {
		notFound()
		return null
	}

	smartRedirect('team', { alias: data.teamAlias })

	return (
		<Box>
			<Typography>Připojuji se k týmu...</Typography>
		</Box>
	)
}
