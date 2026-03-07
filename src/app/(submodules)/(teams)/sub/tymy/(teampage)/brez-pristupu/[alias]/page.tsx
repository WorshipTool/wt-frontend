'use server'
import { getLayoutTeamInfo } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/tech/layout.tech'
import { PageProps } from '@/common/types'
import { Box } from '@/common/ui/Box'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { LockPerson } from '@mui/icons-material'
import { notFound } from 'next/navigation'
import BrezPristupuActions from './BrezPristupuActions'

export default async function BrezPristupuPage(
	props: PageProps<'teamNoAccess'>
) {
	const info = await getLayoutTeamInfo(props.params.alias)
	if (!info) notFound()

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 3,
			}}
		>
			<Box
				sx={{
					backgroundColor: 'white',
					borderRadius: 4,
					padding: { xs: 4, sm: 6 },
					maxWidth: 560,
					width: '100%',
					boxShadow: '0px 2px 16px rgba(0, 0, 0, 0.10)',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 1.5,
				}}
			>
				<LockPerson sx={{ fontSize: 56, color: 'grey.400', mb: 1 }} />

				<Typography variant="h5" strong align="center">
					Obsah nelze zobrazit
				</Typography>

				<Typography align="center" color="grey.700">
					Nemáte oprávnění zobrazit obsah týmu{' '}
					<strong>{info.name}</strong>, protože nejste jeho členem.
				</Typography>

				<Gap value={0.5} />

				<Typography align="center" color="grey.700">
					Pro přístup se připojte do tohoto týmu. Připojit se lze například
					pomocí <strong>přihlašovacího kódu</strong> nebo{' '}
					<strong>přihlašovacího odkazu</strong> – o který je třeba
					poprosit některého člena týmu.
				</Typography>

				<Gap value={1.5} />

				<BrezPristupuActions />
			</Box>
		</Box>
	)
}
