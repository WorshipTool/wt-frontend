'use client'
import JoinTeamPopup from '@/app/(layout)/sub/tymy/components/JoinTeamPopup'
import { Button } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function BezPristupuActions() {
	const { user } = useAuth()
	const [open, setOpen] = useState(false)
	const t = useTranslations('teams.noAccess')

	if (!user) {
		return (
			<Button to="login" toParams={{}}>
				{t('loginButton')}
			</Button>
		)
	}

	return (
		<>
			<Button color="primarygradient" onClick={() => setOpen(true)}>
				{t('joinButton')}
			</Button>
			<JoinTeamPopup open={open} onClose={() => setOpen(false)} />
		</>
	)
}
