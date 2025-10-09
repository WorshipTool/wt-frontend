import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { Box, Clickable } from '@/common/ui'
import { Avatar } from '@/common/ui/mui'
import { grey } from '@/common/ui/mui/colors'
import useAuth from '@/hooks/auth/useAuth'
import { useLiveMessage } from '@/hooks/sockets/useLiveMessage'
import { UserGuid } from '@/interfaces/user'
import { stringToColor } from '@/tech/color/color.tech'
import { useEffect, useMemo, useState } from 'react'

type Person = {
	name: string
	guid: UserGuid
	uniqueId: string
}

type ConnectedPerson = Person & {
	joinedAt: Date
}

type CardChangeData = {
	userGuid: UserGuid
	uniqueId: string
	index: number
}

type StartFollowData = {
	userGuid: UserGuid
	followedUserGuid: UserGuid
}

type PeoplePanelProps = {
	onCardChange: (index: number) => void
	cardIndex: number
}

const SEND_INTERVAL = 5000
const AUTO_LEAVE_INTERVAL = 10000

export default function PeoplePanel(props: PeoplePanelProps) {
	const { guid } = useInnerPlaylist()
	const { user } = useAuth()

	const [_people, setPeople] = useState<ConnectedPerson[]>([])

	const [chosen, setChosen] = useState<Person | null>(null)

	const uniqueId = useMemo(() => {
		return Math.random().toString(36).substr(2, 9)
	}, [])

	const me: Person = useMemo(
		() => ({
			name: user?.firstName + ' ' + user?.lastName,
			guid: user?.guid || ('' as UserGuid),
			uniqueId,
		}),
		[user, uniqueId]
	)

	// unique
	const people = _people
		.filter(
			(person, index, self) =>
				self.findIndex((p) => p.uniqueId === person.uniqueId) === index
		)
		// you at end
		.sort((a, b) => {
			if (a.uniqueId === uniqueId) return 1
			if (b.uniqueId === uniqueId) return -1
			return 0
		})

	const { send } = useLiveMessage(`playlist-${guid}-people`, {
		join: (data: Person) => {
			// Have to be logged in
			if (!user) return

			// Add person to the list
			setPeople((people) => [
				...people,
				{
					...data,
					joinedAt: new Date(),
				},
			])

			if (data.uniqueId !== uniqueId) {
				// Send back that I'm here
				send('imhere', me)
			}
		},
		imhere: (data: Person) => {
			// Add person to the list
			if (!people.find((p) => p.uniqueId === data.uniqueId)) {
				setPeople((people) => [
					...people,
					{
						...data,
						joinedAt: new Date(),
					},
				])
			} else {
				setPeople((people) =>
					people.map((p) => {
						if (p.uniqueId === data.uniqueId) {
							return {
								...p,
								joinedAt: new Date(),
							}
						}
						return p
					})
				)
			}
		},
		leave: (data: Person) => {
			// Remove person from the list
			setPeople((people) => people.filter((p) => p.uniqueId !== data.uniqueId))
			if (chosen && chosen.uniqueId === data.uniqueId) {
				setChosen(null)
			}
		},
		cardChange: (data: CardChangeData) => {
			if (!user) return
			if (!chosen) return

			if (chosen && chosen.uniqueId === data.uniqueId) {
				props.onCardChange(data.index)
			}
		},
		startFollow: (data: StartFollowData) => {
			if (!user) return
			if (data.followedUserGuid === user.guid) {
				send('cardChange', {
					userGuid: user.guid,
					index: props.cardIndex,
					uniqueId: me.uniqueId,
				})
			}
		},
	})

	useEffect(() => {
		if (!user) return

		send('cardChange', {
			userGuid: user.guid,
			index: props.cardIndex,
			uniqueId: me.uniqueId,
		})
	}, [props.cardIndex, user])

	useEffect(() => {
		if (user) send('join', me)

		return () => {
			send('leave', me)
		}
	}, [me])

	useEffect(() => {
		const interval = setInterval(() => {
			if (user) send('imhere', me)
		}, SEND_INTERVAL)

		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		const interval = setInterval(() => {
			// filter people
			setPeople((people) =>
				people.filter((p) => {
					const diff = new Date().getTime() - p.joinedAt.getTime()
					return diff < AUTO_LEAVE_INTERVAL
				})
			)
		}, AUTO_LEAVE_INTERVAL)

		return () => clearInterval(interval)
	}, [chosen])

	return (
		<Box color={'white'} display={'flex'} gap={1}>
			{people.length > 1 &&
				people.map((person) => {
					const selected = chosen && chosen.uniqueId === person.uniqueId
					const you = person.uniqueId === uniqueId

					const onClick = () => {
						if (!user) return
						if (selected) {
							setChosen(null)
						} else {
							setChosen(person)
							send('startFollow', {
								userGuid: user.guid,
								followedUserGuid: person.guid,
							})
						}
					}

					return (
						<Clickable
							key={person.guid}
							onClick={onClick}
							tooltip={selected ? 'Zrušit sledování osoby' : 'Sledovat osobu'}
							disabled={you}
						>
							<Avatar
								key={person.guid}
								sx={{
									bgcolor: !you
										? stringToColor(person.name + person.uniqueId)
										: 'grey',
									width: 30,
									height: 30,
									fontSize: 16,
									border: '1px solid',
									borderColor: grey[700],
									...(selected && {
										borderColor: 'white',
									}),
								}}
							>
								{person.name.split(' ')[0][0]}
								{person.name.split(' ')[1][0]}
							</Avatar>
						</Clickable>
					)
				})}
		</Box>
	)
}
