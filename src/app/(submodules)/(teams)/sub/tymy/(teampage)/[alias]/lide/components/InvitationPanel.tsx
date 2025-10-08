import { Box } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { InfoButton } from '@/common/ui/InfoButton'
import { Link } from '@/common/ui/Link/Link'
import { Typography } from '@/common/ui/Typography'
import { Abc, Link as LinkIcon } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type InvitationPanelProps = {
	joinCode: string
}

export default function InvitationPanel(props: InvitationPanelProps) {
	const t = useTranslations('teams.people.invitation')

	return (
		<Box display={'flex'} flexDirection={'column'} gap={4}>
			<Box flex={1}>
				<Box
					display={'flex'}
					flexDirection={'row'}
					alignItems={'center'}
					// gap={1}
				>
					<Abc fontSize="large" />
					<Gap horizontal value={0.5} />
					<Typography strong>{t('byCode.title')}</Typography>
					<InfoButton expandedWidth={300} lineCount={2}>
						{t('byCode.info.start')}{' '}
						<Link to="teams" params={{}}>
							{t('byCode.info.teamsLink')}
						</Link>{' '}
						{t('byCode.info.end')}
					</InfoButton>
				</Box>
				<Typography color="grey.700">
					{t('byCode.description')}{' -> '}
					<strong>
						<i>{props.joinCode}</i>
					</strong>
				</Typography>
			</Box>
			<Box flex={1}>
				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={2}
					alignItems={'center'}
				>
					<LinkIcon />
					<Typography strong>{t('byLink.title')}</Typography>
				</Box>
				<Typography color="grey.700">
					{t('byLink.description')}
				</Typography>
			</Box>
		</Box>
	)
}
