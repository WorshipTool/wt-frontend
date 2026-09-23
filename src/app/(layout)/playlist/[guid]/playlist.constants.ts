/**
 * Width at which the playlist switches between its two editors.
 *
 * Below it the narrow (phone) layout takes over; at or above it the classic
 * three-panel editor does. Both sides read this one value on purpose: the
 * three-panel editor's left panel — the only place you can add a song or
 * reorder one — hides itself below `md`, so any width where the narrow layout
 * did not yet apply was a width where the playlist could not be edited at all.
 * That gap was papered over with a "use a computer" notice; keeping the two in
 * step is what removes it.
 */
export const PLAYLIST_WIDE_BREAKPOINT = 'md'
