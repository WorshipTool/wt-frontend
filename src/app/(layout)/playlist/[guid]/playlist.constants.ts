import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'

/**
 * Width at which the playlist switches between its two editors.
 *
 * Below it the phone layout takes over; at or above it the three-panel editor
 * does, left panel and all — a tablet is a small desktop, not a big phone.
 *
 * It is the app shell's own breakpoint on purpose. The two designs used to part
 * at different widths: the phone layout stopped at 700 while the left panel —
 * the only place to add a song or reorder one — hid itself below 900, so
 * everything in between had neither, and got a notice telling you to use a
 * computer while you were on one. One value for both sides is what closes that.
 */
export const PLAYLIST_WIDE_BREAKPOINT = MOBILE_NAV_BREAKPOINT
