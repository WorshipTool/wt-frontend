'use client'

import { TAB_ICON_SIZE } from '@/common/components/MobileAppTabBar/TabItem'
import { Avatar } from '@/common/ui/mui'
import { useUserProfileImage } from '@/hooks/useUserProfileImage'
import { useTranslations } from 'next-intl'

/**
 * The signed-in user's own face, in the place the Účet tab's person icon was —
 * the same thing the desktop top bar has put in its right-hand corner all
 * along, and the same hook behind it.
 *
 * It is the one tab that is a *someone* rather than a section, and a photo says
 * that in a way a generic silhouette cannot. The rest of the bar's rules still
 * hold: the ring is `currentColor`, so it greys with the other tabs at rest and
 * lights up brand blue when this is the screen you are on — the tab bar's
 * active state is colour, and this one keeps it. There is no outlined/filled
 * twin to swap, so the ring thickens instead (the same trick the brand sheep
 * uses for having only one weight).
 */
export function AccountTabAvatar({ active }: { active?: boolean }) {
	const tNavigation = useTranslations('navigation')
	const pictureUrl = useUserProfileImage()

	return (
		<Avatar
			src={pictureUrl}
			alt={tNavigation('alt.profileImage')}
			sx={{
				width: TAB_ICON_SIZE,
				height: TAB_ICON_SIZE,
				borderColor: 'currentColor',
				borderStyle: 'solid',
				borderWidth: active ? 2 : 1,
				// the bar's own item handles the tap
				pointerEvents: 'none',
			}}
		/>
	)
}
