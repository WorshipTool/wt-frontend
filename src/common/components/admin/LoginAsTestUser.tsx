'use client'
import AdminOption from '@/common/components/admin/AdminOption'
import useAuth from '@/hooks/auth/useAuth'
import { generateTestEmail } from '@/tech/test-user/generateTestEmail'
import { PersonAdd } from '@mui/icons-material'
import { useState } from 'react'

const TEST_PASSWORD = 'test'
const TEST_FIRST_NAME = 'test'
const TEST_LAST_NAME = 'test'

/**
 * Admin menu option that creates a fresh random test user account and immediately
 * logs in as that user. Useful for quickly testing the app as a new user.
 *
 * Generated credentials:
 *   - First name: test
 *   - Last name: test
 *   - Email: test[RANDOMHASH]@test.cz
 *   - Password: test
 */
export default function LoginAsTestUser() {
	const { signup, login } = useAuth()
	const [isCreating, setIsCreating] = useState(false)

	const handleClick = () => {
		if (isCreating) return
		setIsCreating(true)

		const email = generateTestEmail()

		signup(
			{
				firstName: TEST_FIRST_NAME,
				lastName: TEST_LAST_NAME,
				email,
				password: TEST_PASSWORD,
			},
			async (success) => {
				if (success) {
					await login({ email, password: TEST_PASSWORD })
				}
				setIsCreating(false)
			},
		)
	}

	return (
		<AdminOption
			label="Přihlásit si jako test"
			subtitle="Vytvořit nový random účet"
			icon={<PersonAdd />}
			onClick={handleClick}
			loading={isCreating}
		/>
	)
}
