export const teamPayloadDefaults: TeamPayload = {
	showSongbookForNotMembers: false,
	assistantName: '',
}

export type TeamPayload = {
	showSongbookForNotMembers: boolean
	assistantName: string
}
