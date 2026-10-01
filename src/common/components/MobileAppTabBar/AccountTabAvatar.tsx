'use client'

import { TAB_ICON_SIZE } from '@/common/components/MobileAppTabBar/TabItem'
import { Avatar } from '@/common/ui/mui'
import { useUserProfileImage } from '@/hooks/useUserProfileImage'
import { useTranslations } from 'next-intl'

/** The ring at rest; it doubles when the tab is the current one. */
const RING = 1
/**
 * Outer size, held the same in both states.
 *
 * MUI's Avatar sizes its content, so the ring used to be drawn *outside* the
 * 25px it was given: 27px at rest, 29px lit, which made the tab two pixels
 * taller and shunted the whole bar up the moment the Účet menu opened. The box
 * is the fixed thing now and the ring thickens inwards, which is the only place
 * a state can put ink on a bar without moving it.
 */
const SIZE = TAB_ICON_SIZE + RING * 2

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
				width: SIZE,
				height: SIZE,
				boxSizing: 'border-box',
				borderColor: 'currentColor',
				borderStyle: 'solid',
				borderWidth: active ? RING * 2 : RING,
				// the bar's own item handles the tap
				pointerEvents: 'none',
			}}
		/>
	)
}
