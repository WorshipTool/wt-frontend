import TeamCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamCard/TeamCard'
import { useTeamPayload } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/payload/useTeamPayload'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box, Checkbox, TextField, Typography } from '@/common/ui'
import { useEffect, useState } from 'react'

export default function AdvancedSettings() {
	const { guid: teamGuid } = useInnerTeam()
	const [_value, _setValue, loading] = useTeamPayload(teamGuid)

	const [value, setValue] = useState<boolean>(false)
	const [assistantName, setAssistantName] = useState<string>('')

	const onChange = (e: any, value: boolean) => {
		setValue(value)
		_setValue({
			showSongbookForNotMembers: value,
			assistantName: assistantName,
		})
	}

	const onAssistantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value
		setAssistantName(newName)
		_setValue({
			showSongbookForNotMembers: value,
			assistantName: newName,
		})
	}

	useEffect(() => {
		setValue(_value.showSongbookForNotMembers)
		setAssistantName(_value.assistantName || '')
	}, [_value.showSongbookForNotMembers, _value.assistantName])
	return (
		<TeamCard>
			<Box
				display={'flex'}
				justifyContent={'space-between'}
				flexDirection={'column'}
				flexWrap={'wrap'}
				gap={3}
			>
				<Box maxWidth={500}>
					<Typography variant={'h6'} strong>
						Co se má zobrazit lidem, kteří nejsou členy?
					</Typography>
					<Typography color="grey.600">
						Lidé mimo tým, mohou být rovnou přesměrováni pryč, nebo jim může být
						zobrazen alespoň seznam písní.
					</Typography>
				</Box>
				<Checkbox
					label={'Zobrazit seznam písní pro lidi mimo tým'}
					checked={value}
					onChange={onChange}
					disabled={loading}
				/>
				<Box maxWidth={500}>
					<Typography variant={'h6'} strong>
						Vlastní jméno asistenta
					</Typography>
					<Typography color="grey.600">
						Přiřaďte asistentovi vlastní jméno, které bude rozpoznávat a používat během konverzace.
					</Typography>
				</Box>
				<TextField
					label="Jméno asistenta"
					value={assistantName}
					onChange={onAssistantNameChange}
					disabled={loading}
					placeholder="Např. Honza, Marie, Pomocník..."
					fullWidth
					sx={{ maxWidth: 500 }}
				/>
			</Box>
		</TeamCard>
	)
}
