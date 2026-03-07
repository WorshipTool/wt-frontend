'use client'
import JoinTeamPopup from '@/app/(layout)/sub/tymy/components/JoinTeamPopup'
import { Button } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useState } from 'react'

export default function BrezPristupuActions() {
	const { user } = useAuth()
	const [open, setOpen] = useState(false)

	if (!user) {
		return (
			<Button to="login" toParams={{}}>
				Přihlásit se
			</Button>
		)
	}

	return (
		<>
			<Button color="primarygradient" onClick={() => setOpen(true)}>
				Připojit se k týmu
			</Button>
			<JoinTeamPopup open={open} onClose={() => setOpen(false)} />
		</>
	)
}
