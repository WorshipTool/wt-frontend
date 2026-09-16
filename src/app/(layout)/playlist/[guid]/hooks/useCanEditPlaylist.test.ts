import { TeamGuid } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import PlaylistDto, {
	PlaylistGuid,
} from '@/interfaces/playlist/playlist.types'
import { renderHook } from '@testing-library/react'
import useCanEditPlaylist from './useCanEditPlaylist'

const TEAM_GUID = 'team-1' as TeamGuid
const OTHER_TEAM_GUID = 'team-2' as TeamGuid

const OWNER_GUID = 'user-owner'
const TEAM_OWNER_GUID = 'user-team-owner'

let mockUser: { guid: string } | undefined
let mockTeam: { guid: TeamGuid; isCreator: boolean } | null
let mockPermissions: { type: string; payload: unknown }[]

jest.mock('../../../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({ user: mockUser }),
}))

jest.mock(
	'../../../../(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam',
	() => ({
		useCurrentTeam: () => mockTeam,
	})
)

jest.mock('../../../../../hooks/permissions/usePermission', () => ({
	usePermission: (type: string, payload: unknown) =>
		mockPermissions.some(
			(p) =>
				p.type === type &&
				JSON.stringify(p.payload) === JSON.stringify(payload)
		),
}))

const makePlaylist = (over: Partial<PlaylistDto> = {}): PlaylistDto => ({
	guid: 'playlist-1' as PlaylistGuid,
	title: 'Nedělní chvály',
	items: [],
	ownerGuid: OWNER_GUID,
	...over,
})

const teamPlaylist = () => makePlaylist({ teamGuid: TEAM_GUID })

const canEdit = (playlist?: PlaylistDto) =>
	renderHook(() => useCanEditPlaylist(playlist)).result.current

describe('useCanEditPlaylist', () => {
	beforeEach(() => {
		mockUser = { guid: TEAM_OWNER_GUID }
		mockTeam = { guid: TEAM_GUID, isCreator: true }
		mockPermissions = []
	})

	it('lets the team owner edit a team playlist created by another member', () => {
		// The reported bug: no add-song button for the owner of the team
		expect(canEdit(teamPlaylist())).toBe(true)
	})

	it('lets the team owner edit even without any granted team permission', () => {
		mockPermissions = []
		expect(canEdit(teamPlaylist())).toBe(true)
	})

	it('lets a team manager edit a team playlist of another member', () => {
		mockTeam = { guid: TEAM_GUID, isCreator: false }
		mockPermissions = [
			{ type: 'team.add_song', payload: { teamGuid: TEAM_GUID } },
		]
		expect(canEdit(teamPlaylist())).toBe(true)
	})

	it('grants the manager rights outside of the team page context too', () => {
		mockTeam = null
		mockPermissions = [
			{ type: 'team.add_song', payload: { teamGuid: TEAM_GUID } },
		]
		expect(canEdit(teamPlaylist())).toBe(true)
	})

	it('keeps a plain member out of a team playlist of another member', () => {
		mockTeam = { guid: TEAM_GUID, isCreator: false }
		mockPermissions = []
		expect(canEdit(teamPlaylist())).toBe(false)
	})

	it('lets the playlist owner edit their own playlist', () => {
		mockUser = { guid: OWNER_GUID }
		mockTeam = null
		expect(canEdit(makePlaylist())).toBe(true)
	})

	it('does not leak team rights to a playlist outside of any team', () => {
		mockPermissions = [
			{ type: 'team.add_song', payload: { teamGuid: TEAM_GUID } },
		]
		expect(canEdit(makePlaylist())).toBe(false)
	})

	it('does not let the owner of one team edit a playlist of another team', () => {
		mockTeam = { guid: OTHER_TEAM_GUID, isCreator: true }
		mockPermissions = [
			{ type: 'team.add_song', payload: { teamGuid: OTHER_TEAM_GUID } },
		]
		expect(canEdit(teamPlaylist())).toBe(false)
	})

	it('returns false for a logged out user and while the playlist loads', () => {
		mockUser = undefined
		expect(canEdit(teamPlaylist())).toBe(false)

		mockUser = { guid: TEAM_OWNER_GUID }
		expect(canEdit(undefined)).toBe(false)
	})
})
