'use client'

import useAuth from '@/hooks/auth/useAuth'
import dynamic from 'next/dynamic'

const AdminEditOverlay = dynamic(
	() => import('@/common/components/admin/EditProposals/AdminEditOverlay'),
	{ ssr: false }
)

const ProposalDialog = dynamic(
	() => import('@/common/components/admin/EditProposals/ProposalDialog'),
	{ ssr: false }
)

const ProposalCornerButton = dynamic(
	() => import('@/common/components/admin/EditProposals/ProposalCornerButton'),
	{ ssr: false }
)

const AdminOptionsProvider = dynamic(
	() => import('@/common/components/admin/AdminOptions'),
	{ ssr: false }
)

const GlobalAdminNavOptions = dynamic(
	() => import('@/common/components/admin/GlobalAdminNavOptions'),
	{ ssr: false }
)

const ImplementIdeaProvider = dynamic(
	() => import('@/common/components/ImplementAndPreview/ImplementIdeaProvider'),
	{ ssr: false }
)

/**
 * Lazy-loads admin-only components. These components are only downloaded
 * when the current user is an admin, saving ~100-200 KiB of JS for regular users.
 */
export default function LazyAdminComponents() {
	const { isAdmin } = useAuth()

	if (!isAdmin()) return null

	return (
		<>
			<AdminOptionsProvider />
			<GlobalAdminNavOptions />
			<ImplementIdeaProvider />
			<AdminEditOverlay />
			<ProposalDialog />
			<ProposalCornerButton />
		</>
	)
}
