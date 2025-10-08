'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { SmartTeamPage } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/SmartTeamPage'
import TeamCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamCard/TeamCard'
import { TeamPageTitle } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TopPanel/components/TeamPageTitle'
import { useTeamLogo } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/hooks/useTeamLogo'
import AdvancedSettings from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/nastaveni/components/AdvancedSettings'
import LogoPanel from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/nastaveni/components/LogoPanel'
import TeamEditableCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/nastaveni/components/TeamEditableCard'
import TeamEditableField from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/nastaveni/components/TeamEditableField'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import Popup from '@/common/components/Popup/Popup'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { usePermission } from '@/hooks/permissions/usePermission'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { Delete } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useEffect, useMemo, useState } from 'react'

export default SmartTeamPage(TeamSettingsPage)

function TeamSettingsPage() {
	const t = useTranslations('teams.settings')
	const tCommon = useTranslations('common')
	const {
		name: _name,
		joinCode: _joinCode,
		guid,
		reload,
		isCreator,
	} = useInnerTeam()

	const hasPermissionToEdit = usePermission<TeamPermissions>(
		'team.change_base_info',
		{
			teamGuid: guid,
		}
	)

	const { teamEditingApi } = useApi()

	const [name, setName] = useState(_name)
	const [joinCode, setJoinCode] = useState(_joinCode)

	useEffect(() => {
		setName(_name)
	}, [_name])

	useEffect(() => {
		setJoinCode(_joinCode)
	}, [_joinCode])

	const onCancel = () => {
		setName(_name)
		setJoinCode(_joinCode)
		setChosenFile(null)
	}

	const logo = useTeamLogo()
	const [chosenFile, setChosenFile] = useState<File | null>(null)

	const logoUrl = useMemo(() => {
		if (chosenFile) {
			return URL.createObjectURL(chosenFile)
		}
		return logo.logoUrl
	}, [logo.logoUrl, chosenFile])

	const onLogoSelect = async (file: File | null) => {
		setChosenFile(file)
	}

	const onSave = async () => {
		try {
			await teamEditingApi.changeTeamInfo({
				teamGuid: guid,
				teamName: name,
				joinCode,
			})
		} catch (e) {
			enqueueSnackbar(
				'Nepodařilo se uložit změny. Nejspíše je tento kód již použitý.'
			)
			reload()
			return
		}

		if (chosenFile) logo.changeLogo(chosenFile)

		reload()
	}

	const navigate = useSmartNavigate()
	const { enqueueSnackbar } = useSnackbar()
	const onTeamPermanentRemove = async () => {
		setDeletePopupOpen(false)
		await teamEditingApi.deleteTeam({
			teamGuid: guid,
		})
		navigate('teams', {})
		enqueueSnackbar(t('teamDeleted'))
	}

	const [deletePopupOpen, setDeletePopupOpen] = useState(false)

	return (
		<Box display={'flex'} flexDirection={'column'} gap={1}>
			<TeamPageTitle>{t('title')}</TeamPageTitle>

			<TeamEditableCard
				title={t('basicInfo')}
				onCancel={onCancel}
				onSave={onSave}
				editable={Boolean(hasPermissionToEdit)}
			>
				{(editMode) => (
					<Box
						display={'flex'}
						flexDirection={'row'}
						marginTop={2}
						flexWrap={'wrap'}
					>
						<Box flex={1}>
							<Box
								display={'flex'}
								flexDirection={'column'}
								gap={2}
								maxWidth={300}
							>
								<TeamEditableField
									label={t('teamName')}
									value={name}
									editable={editMode}
									onChange={setName}
								/>
								<TeamEditableField
									label={t('joinCode')}
									value={joinCode}
									editable={editMode}
									onChange={setJoinCode}
								/>
							</Box>
						</Box>
						<Box>
							<LogoPanel
								editable={editMode}
								imageUrl={logoUrl}
								onChange={onLogoSelect}
								loading={logo.loading}
							/>
						</Box>
					</Box>
				)}
			</TeamEditableCard>
			{isCreator && <AdvancedSettings />}
			{isCreator && (
				<TeamCard
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						flexWrap: 'wrap',
						gap: 1,
					}}
				>
					<Box display={'flex'} flexDirection={'column'}>
						<Typography variant="h6" strong>
							Smazání týmu
						</Typography>
						<Typography>
							Po smazání týmu nebude možné tým obnovit. Záznamy o týmu budou
							smazány.
						</Typography>
					</Box>

					<Box
						display={'flex'}
						flexDirection={'column'}
						justifyContent={'center'}
					>
						<Button
							color="error"
							size="small"
							startIcon={<Delete />}
							variant="outlined"
							onClick={() => setDeletePopupOpen(true)}
						>
							Odstranit tým
						</Button>
					</Box>

					<Popup
						open={deletePopupOpen}
						onClose={() => setDeletePopupOpen(false)}
						title={t('confirmDelete')}
						icon={<Delete />}
						actions={[
							<Button
								key={'delete'}
								variant="text"
								color="error"
								onClick={onTeamPermanentRemove}
							>
								Ano, nevratně odstranit
							</Button>,
							<Button
								key={'cancel'}
								type="reset"
								tooltip={t('closePopupTooltip')}
							>
								{tCommon('cancel')}
							</Button>,
						]}
						width={400}
					>
						<Typography>
							Snažíte se smazat tým <b>{_name}</b>. Tato akce je nevratná. Jste
							si jistí, že chcete pokračovat?
						</Typography>
					</Popup>
				</TeamCard>
			)}
		</Box>
	)
}
