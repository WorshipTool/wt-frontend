'use client'
import { useCurrentTeam } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import useAuth from '@/hooks/auth/useAuth'
import { usePermission } from '@/hooks/permissions/usePermission'
import PlaylistDto from '@/interfaces/playlist/playlist.types'
import { useMemo } from 'react'

/**
 * Decides who may edit a playlist (add songs, reorder, rename, save).
 *
 * A playlist attached to a team is a shared team asset — its owner is just the
 * member who happened to create it, so ownership alone locked everyone else
 * out, the team owner included. Team managers therefore edit the team's
 * playlists as well, and the team owner always can.
 */
export default function useCanEditPlaylist(playlist?: PlaylistDto) {
	const { user } = useAuth()
	const team = useCurrentTeam()

	const playlistTeamGuid = playlist?.teamGuid

	const hasTeamSongPermission = usePermission<TeamPermissions>(
		'team.add_song',
		{ teamGuid: playlistTeamGuid || '' }
	)

	return useMemo(() => {
		if (!playlist || !user) return false

		if (playlist.ownerGuid === user.guid) return true

		// Playlists outside of a team stay private to their owner
		if (!playlistTeamGuid) return false

		// The owner of the team keeps the rights even when the managers
		// permission group does not carry them (teams created before a
		// permission was introduced never got it granted).
		if (team?.guid === playlistTeamGuid && team.isCreator) return true

		return Boolean(hasTeamSongPermission)
	}, [playlist, user, playlistTeamGuid, team, hasTeamSongPermission])
}
