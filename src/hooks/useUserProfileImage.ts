import useAuth from '@/hooks/auth/useAuth'

export const useUserProfileImage = (userGuid?: string) => {
	const { info } = useAuth()
	if (userGuid !== info.guid) {
		return '/assets/profile-image-default.webp'
	}

	return '/assets/profile-image-default.webp'
	// info.pictureUrl ||
}
