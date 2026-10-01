# MOBILE.md — mobile app-shell rules (phones, < 700px)

The phone experience is a **native-feeling app shell**, distinct from the
desktop layout. These rules keep it consistent and calm. They apply below
`MOBILE_NAV_BREAKPOINT` (700px); desktop is unaffected.

Read this alongside `DESIGN-SYSTEM.md`, `COMPONENTS.md` and `PATTERNS.md`.
When a mobile screen looks busier or louder than its neighbours, it's wrong
even if it looks fine in isolation.

## The shell

Every app-shell screen is built from `@/common/ui`'s **`MobileAppHeader`**
(`common/components/MobileAppHeader`). It owns the whole viewport minus the
bottom tab bar and **only the middle content scrolls** — the header, an
optional top control strip, an optional bottom panel and the tab bar all stay
pinned. So the scrollbar belongs to the content, never the full height.

```
┌──────────────────────────────────────────────┐
│ ←  Title                     [ 0–2 icons ]    │  header (large → shrinks on scroll)
│    subtitle (ReactNode)                        │
├──────────────────────────────────────────────┤
│ [ controlPanel: segment / chips ]  (optional)  │  pinned under the header
├──────────────────────────────────────────────┤
│                 content scrolls                │
├──────────────────────────────────────────────┤
│ [ bottomPanel: pagination … ]      (optional)  │  pinned above the tab bar, QUIET
└──────────────────────────────────────────────┘
                (global nav — tab bar)              rendered globally, not by the page
```

Slots: `title`, `subtitle` (any node), `backTo`/`backParams` (hierarchical Up,
hidden on tab-roots), `actions` (≤ 2 icons, right of the title), `controlPanel`
(top strip), `bottomPanel` (above the tab bar), `scrollResetKey`, `surface`,
`divider`, `overlay`.

**One large title.** `LARGE_TITLE_REM` (1.5rem) and `LARGE_TITLE_COMPACT_REM`
(1.125rem) in `common/constants/layout.ts`, with `largeTitleSx` for the rest of
it — weight, tracking, line height, colour. The header row and the catalog
(whose title scrolls with the list instead of sitting in the header) both take
the size; to whoever is looking it is *the same title*, so neither keeps its own
copy of the style. It was 1.85rem and read as the loudest thing on every screen,
a song included, where it outweighed the sheet it was announcing. The size
belongs to the screen, because the header animates it on scroll.

1.5 → 1.125 are what the scale **renders on a phone** for `h3` and `h5`, which
is not what `theme.tsx` declares for them: it ends in `responsiveFontSizes()`,
so every declared heading size is the size at the widest breakpoint and below
600px you get `1 + (max − 1) / 2`. Reach for `variant="h4"` expecting 1.5rem and
you will get 1.25. Don't use a heading variant here anyway — the phone shell
runs to `MOBILE_NAV_BREAKPOINT` (700px) and h3 steps back up at 600px, so the
title would grow between 600 and 700.

**Two screens keep their own size**, both on purpose: home's hero (below) and
the playlist detail, whose title is a hand-tuned morph between two absolute
sizes (23 → 17.5px) with tracking that has drifted to -0.3px. The playlist is
the only screen still holding its own copy of the *style*; folding it in is its
own small job.

**Home's hero stays at 1.85rem.** Every other screen *names* itself and does it
in a bar you read past; home *greets* you, has no bar to fit in, and is the one
screen with the room. It wears `largeTitleSx` like the rest, so only its size
differs — and that size is load-bearing: the sheep is cut to the gap this title
leaves above the search field.

**Same header height everywhere.** The header row keeps a fixed minimum height
(matching the back-arrow / action buttons) so a title-only header (Účet)
collapses to exactly the same height as one with controls (Písně, Moje písně,
Oblíbené). The back arrow appears only when `backTo` is set — tab-roots (Domů /
Písně / Účet) have none by design; you switch to them via the tab bar.

## The shell is fixed — never in flow

`MobileAppHeader` is `position: fixed` (top 0 → `MOBILE_NAV_CLEARANCE`), and
that is not negotiable: **an app-shell screen must never contribute height to
the document.**

If it does, the page itself becomes scrollable *underneath* the shell and you
get two stacked scrollers. Anything the inner one doesn't consume — a drag on
the header, or on the content once it hits its end — falls through to the
document and carries the whole shell, header included, off the top of the
screen. This shipped once (the shell had an in-flow mode used by every screen
except the song page) and is exactly what it looks like on a real device.

So: don't give the shell a height, a `minHeight`, or an in-flow wrapper, and
don't reintroduce a "reclaim the space above" negative margin — the Toolbar
deliberately contributes no spacer on these routes. A screen that builds its
own shell instead of using `MobileAppHeader` (today only the playlist detail)
must use the same fixed frame.

The invariant to check on any shell route: scrolling the *window* moves it 0px.

**And it must already be true before the page wakes up.** Which layout a screen
wears is a JS media query, so what the server renders — and what stands on the
screen until hydration finishes — is the *desktop* layout, which is a screenful
taller than a phone. Drag that and the gesture belongs to the document for as
long as it lasts, momentum included; by the time it ends the shell is fixed over
the top of it, so the screen ignores you until you lift your finger and try
again. It reads as a phantom scroller in front of everything, and it lasted
~2.5s on a dev build — longer the slower the phone.

So an app-shell screen declares itself in `APP_SHELL_SCREENS`
(`nav.constants.ts`), and `MobileShellScrollLock` — rendered once in
`AppLayoutInner` — puts `:root { overflow: hidden }` under the shell's own
breakpoint into the first HTML the browser gets. A rule, not a `style.overflow`
set on mount: mounting is hydration, which is the end of the window rather than
the start of it. **Add a screen to that list whenever you give it
`MobileAppHeader`** — one left out gets the phantom back, and the screens that
legitimately scroll their document (marketing pages, the team module, the
storybook, the playlist detail) must stay out of it.



Ask **`useIsPhone()`** (`common/hooks/useIsPhone`) — never spell out
`useMediaQuery(theme.breakpoints.down(…))` and never write `700` by hand.
Several pages had drifted to a literal `700` while the shell used the constant,
so moving the breakpoint would have moved the tab bar but not the page bodies
inside it.

**Prefer no branch at all.** `useIsPhone()` is a JS media query: it returns
`false` during SSR and the first hydration render, so a JS branch flashes the
desktop layout for a frame. When the two layouts hold the *same* content in a
different arrangement, express it in CSS instead — mobile-first base styles plus
a `theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)` block (see `CreateOptionItem`,
which is a row on phones and a card on desktop with no JS branch at all).

Reach for `useIsPhone()` only where the two are genuinely different trees — in
practice that means choosing the *shell wrapper* (`MobileAppHeader` vs the
desktop page chrome), which `MobileAppHeader` requires anyway since it hides
itself above the breakpoint in CSS. Aim for **one branch per page**, around the
shell, with the content shared beneath it.

## Which routes are in the shell

`MobileAppTabBar/nav.constants.ts` is the single source of truth: it decides the
active tab, whether the tab bar renders, and whether the top bar hides. It is
keyed by **`routesPaths` keys**, not path strings, so renaming a route is a
compile error rather than a silently broken shell. Add a route to `TAB_BY_ROUTE`
to bring it into the shell. It has tests — keep them passing.

**Every screen a user can reach is in the shell.** Being reachable and having
nothing on screen that leads anywhere is the bug the shell exists to prevent —
and an installed app has no browser Back to fall back on. So sign-in, sign-up,
password reset, the team module, the marketing pages and the 404 all show the
bar. Two lists express the difference between *being in the shell* and *being
in a tab*:

- `TAB_BY_ROUTE` — the route belongs to a tab, and that tab lights up. Auth and
  the password reset sit under **account** (that is the tab that leads there
  while signed out); the whole team module sits under **tools**, the sheet it
  is opened from.
- `SHELL_ONLY` — the bar shows with nothing lit, for screens that belong to no
  tab. Marketing pages live here; the 404 has no route key at all and asks for
  the bar directly with `<MobileAppTabBar force />`.

**The exception is projection.** Song and playlist presentation modes own the
whole display on purpose and stay out, as does anything that returns a file
rather than a screen (the PDF routes).

**Mounting.** The bar renders next to the top bar in `AppLayoutInner`, which
only the `(layout)` group uses. The chromeless `(nolayout)` group and the
`(submodules)` group mount it in their own layouts, so the routes living there
can show it at all. Only one group's layout is ever mounted for a given route,
so there is never a second bar.

## One dock, one bar

There is exactly **one strip at the bottom of a phone screen**, and it is always
`MobileBottomDock`: the fixed container, the `ABOVE_TABBAR_SLOT_ID` slot above
it, the strip's own chrome (white, 1px `grey.200` top border, 71px tall), the
z-index and the desktop cut-off are stated there once. A bar supplies items, not
a container.

**A module may take the dock over, but never stack a second bar in it.** Inside
a team the team's four sections *are* the bar: they are listed in
`CONTEXTUAL_BAR_ROUTES`, the app's tab bar renders nothing there, and
`TeamBottomPanel` puts the team's items in the dock instead. Two bars stacked
cost 131px of a 664px screen and read as two competing navigations.

Whoever takes the dock over **inherits the duty to lead somewhere out.** The
team bar's first item is the app's home tab — same sheep, same destination, the
wording the Nástroje menu already uses (`navigation.toolsMenu.outsideTeam`) —
followed by a 1px `grey.200` hairline; the sections then share the rest of the
width evenly. It is a leading item, not a fifth section: it is only as wide as
its own label.

`CONTEXTUAL_BAR_ROUTES` must list exactly the routes the module's layout covers.
One route short and that screen has no bar at all.

**Nothing that floats over the page may sit on top of the bar.** An anchored
popup, a docked panel, a toast, a floating control — all of them stop a gutter
short of the dock and grow upwards (or scroll) instead of running underneath it.
The bar is the way out of wherever you are; a layer that buries it leaves the
screen with no exit, on the one device that has no browser Back either.

Ask `measureBottomDock()` rather than hard-coding a height: it reads the dock
that is actually on screen, so it follows the bar that has it, counts a page's
`PageAction` strip when one is docked, and returns `0` on desktop and off-shell
routes, where there is nothing to clear. `getPopupPosition` in the song picker
is the worked example — it takes the inset and both anchors respect it.

A full-screen modal that dims the whole page (the house `Popup`) is the
exception: it covers everything on purpose, bar included, and its own buttons
are the way out.

**A page that sizes itself to the viewport must say so.** The bar renders an
in-flow spacer so content can scroll clear of it; a page that already claims
`100vh`/`100dvh` would then scroll by the spacer's height and push its own
footer under the bar. Such pages go in `OWNS_BOTTOM_CLEARANCE` and pad their own
bottom with `MOBILE_NAV_CLEARANCE` instead (the auth sheets do this).

Feed it `useClientPathname()`, not `usePathname()`: only the former re-applies
subdomain prefixes, and the raw one misclassifies every route on a subdomain.

## Search is a control, not a place

**One screen answers searches: the catalog (`/pisne`).** Its field is the
screen's `controlPanel`, and what the field holds decides the body — empty, you
browse the songbook A–Z; typed, the same screen shows results. Nothing else in
the app opens a search layer, and no other screen renders search results.

**Only the field pins; the title is content.** On the catalog the large title
scrolls away with the list and the field's band is `position: sticky` at
`TOOLBAR_SPACER`, the way home's is — a phone screen is too short to spend a
row on a bar repeating what the lit tab already says, and sticky keeps the band
in step with the page without anything reading the scroll. The band's hairline
appears only once it has arrived at the top and rows start passing under it.

**The field takes the screen over while you search.** With `?hledat` the title
folds away (`collapseTitle`), so the field is the whole top of the screen;
leave search and it comes back. It answers to the URL, not to the caret:
clicking the field and writing nothing is not searching, and the page stays
where it is. On a desktop the same moment lifts the field out of the flow to
sit half in the top bar, whose own links stand down while it is there.

`?hledat=` is that screen's parameter. Empty means *someone asked to search*:
the field takes the caret and the browse list stays under it, so you can type or
keep browsing. With a query it is a shared link, which shows results without
popping a keyboard. Typing mirrors itself in with `replaceState` — shareable and
reloadable, without a history entry per keystroke.

Every "Hledat" in the app is a link to that one place: the tab bar's Hledat, the
desktop toolbar, the footer. **Písně and Hledat are two doors into the same
screen**, which is why the lit tab comes from the parameter (present → Hledat)
rather than from a flag someone has to remember to set.

**Home's bar is a door you type through, not one you tap through.** It is a
real field on both widths: tapping it only puts the caret in it — leaving home
before a word exists costs a screen for nothing — and the catalog opens when
you pause (400ms on a phone, 600ms on a desktop, or Enter), carrying what you
typed. The caret goes with it: home records the hand-off in a module flag
(`searchHandoff`) and the catalog's field takes the caret and puts it at the
end of the word, so the next letter lands where the last one did. The flag
lives only as long as the navigation, so a shared or reloaded `?hledat=` link
still shows its results without opening a keyboard over them.

Wait for the pause rather than jumping on the first letter: the two screens
swap around the caret, and a letter typed mid-swap has no field to land in.

**The keyboard belongs to the tap.** A phone opens it for a field focused
inside the gesture and for nothing else, so focus given from an effect — the
earliest the catalog's field exists, a navigation after the tab was tapped —
moves the caret and leaves the keyboard shut. The Hledat tab therefore focuses
a field itself, while the tap still counts as one: the catalog's own field when
that screen is already up (which is also the only thing that answers a second
tap on Hledat, since it changes no URL and wakes no effect), and otherwise a
stand-in of one invisible pixel that the real field takes the caret from on
arrival. Moving focus between two fields leaves the keyboard up; letting go of
the last one is what closes it — so the stand-in is removed only after the real
field has focus, and a tap whose navigation never lands gives the keyboard back
after two seconds rather than leaving a focused nothing behind. It is
`takeSearchKeyboard()` / `releaseSearchKeyboard()` in `searchHandoff`, and the
stand-in must be neither `display: none` nor `readonly` (either keeps the
keyboard shut) and at least 16px of font (smaller makes iOS zoom the page in).

**The field travels; it is never two fields.** The place it stood goes with the
caret — `handOffSearchFocus(el)` takes the element it is leaving — and the
catalog's field starts life in that rect and flies to its own over 280ms. Same
trick inside the catalog, where the field has two homes (the list's heading line
while you browse, half in the top bar while you search): measure where it was,
let the browser lay out where it is now, animate the difference away (a FLIP,
`Element.animate`, width travelling with it). A CSS transition cannot do either
of those moves — the first crosses a navigation, the second crosses between a
box in the flow and one fixed to the window.

Two rules that keep it honest: a trip in flight is never interrupted (the screen
re-renders several times over those 280ms — the query lands, the results arrive
— and each of those must leave the animation alone), and a rect is never read
while one is running, because that reads where the field is in the air rather
than where the layout puts it. A move of under a pixel is not animated at all:
on a phone the field keeps its band when searching starts, and the title folding
away above it already carries it down.

This is the rule that was broken for a long time: search was a *mode of the home
page*, so the songs list had no search at all, two tabs pointed at one route, and
"Hledat" on any other screen meant leaving that screen for home.

## Screens that hold unsaved work

A screen keeping user work in local state (a song being written, a playlist
being reordered, an upload being parsed) must declare it:

```tsx
useBlockAppReload(sheetData !== '', 'writing a song')
```

`AppUpdater` reloads the page when a new build ships; without this it would
silently throw that work away. The update is applied as soon as the last blocker
clears.

**Adding something is not a draft edit.** A walkthrough added three songs to a
playlist, watched the header count them, left, came back to an empty playlist
and never saw a warning: the phone's save hangs on leaving edit mode, and the
add control shows outside edit mode too. Anything reached from outside an edit
mode commits by itself — `addItemsAndSave`, `renameAndSave`. Reordering and
removing stay behind the ✓, because that is where the user put them.

**An edit mode shows its save and nothing else.** The playlist's hero used to
keep prezentace / sdílet / ⋮ beside the ✓ while you were reordering, and the
blue primary still said Tisknout — three actions that each quietly called
`save()` on your behalf before doing their own thing. In edit mode the row of
circles stands down and **Uložit** takes its place on the left, where the
buttons were: the one way out of the mode is the one button on the screen.

It does not morph into the compact bar the way Tisknout does. Tisknout starts
at the right and only has to rise; a left-hand button would have to sweep the
width of the header to reach the same corner, and `MorphItem`'s translations
are fixed px, so the distance would be wrong on every other screen width.
Uložit lifts out with the rest of the hero over `[0, 0.45]` and the bar grows
its own round ✓ in the primary's place over `[0.5, 1]` — the doc's other rule
(things that exist in one state only just fade) rather than the morph.

**A playlist's song is transposed where the desktop transposes it — inside the
card, above the song.** The detail view's slides carry the same bare `−`/`+`
the desktop's `TopPlaylistItemPanel` puts at the top of its `Paper`, and no key
label: the key already has a home in the list's row chip, and the song page's
`− Tónina C +` pill belongs to the page whose whole dock is one row of
controls, not inside a card that is otherwise all song.

Detail mode is not edit mode, so the change writes itself — but not once per
tap. A key is chosen a semitone at a time and each write rewrites the whole
playlist, so the write waits 800ms for the tapping to stop and then sends one,
with the list read from a ref: the timer outlives the render that armed it, and
that render's `state` is the list before the last tap. Measured: three quick
taps, one `POST /playlist/complex`.

**And the way back out asks.** The reorder and the bin live in local state
until that save, so the back arrow was the one control left that could throw
work away without a word. It now raises the same question a browser does when
you close a tab with unsaved work — *Máte neuložené změny. Opustit playlist?* —
with Zrušit and Zahodit, and only when `isSaved` is false, so leaving an
untouched edit mode still costs one tap. (`beforeunload` already covered a real
page unload; this covers the in-app leave.)

A save that follows a change in the same breath has to be **handed** the new
value. `save()` reads `state` out of the render it was created in, which at that
moment still holds the old one, so `_persist(name, items)` takes both. The same
trap in reverse is `addItem` in a loop: every call read the same `state.items`
and the last write won, so picking three songs added one.

## A phone on its side is a different budget

Portrait hands the app 664px and the shell's three bands — header, dock, tab
bar — take about 200 of them, which nobody notices. Turned sideways the bands
still cost 200 and the screen is 320, so the song someone turned the phone *for*
was read through a 126px slot: a third of the display, measured.

Everything tightens under `SHORT_VIEWPORT` (`@media (max-height: 430px)`, a
height query so a tablet on its side keeps the roomy shell): the tab bar drops
its captions and its padding (73 → 44), the song dock loses its breathing room
(70 → 52) and the header its top pad (61 → 51). Portrait is untouched.

**And the reserve overshoots on purpose.** `--mobile-nav-bar-height` is what a
page pads the end of its scroll with, and it read 71 while the bar measured 75
— its border and the captions' descenders. Four pixels, and the last card of
the account screen ended under the bar with its bottom corners cut off. It is
76 now (48 sideways): a sliver of blank at the end of a scroll is invisible,
four pixels of a card are not.

**A band that shrinks has to take its reserve with it.** The first attempt
tightened all three and changed nothing: the room pages keep free at the bottom
is `MOBILE_NAV_CLEARANCE` and the song page's dock reserve, both constants, and
they went on holding 80 and 70px of now-empty strip. They are CSS variables in
`globals.css` now (`--mobile-nav-clearance`, `--mobile-nav-bar-height`,
`--song-dock-reserve`), each with its own value under the same query, because a
reserve that cannot answer a media query is not a reserve, it is a gap. Measured
after: the song gets 173px of 320 on an iPhone SE (was 116) and 237 of 390 on an
iPhone 13 (was 113).

## Something floating above the tab bar takes `bottomInset`, not padding

`MobileAppHeader` scrolls only its middle content, and anything pinned above the
tab bar — the song page's dock — floats over that content. Padding at the end of
the content clears the dock for the *last* line and nothing else: at every other
scroll position the dock lay across whatever line you had stopped on, cutting it
in half.

`bottomInset={n}` reserves the room as a sibling of the scroller, so the
scroller is shorter by that much and no line can pass underneath. The song page
passes `MOBILE_SONG_DOCK_RESERVE`, which the dock exports from its own height
and gap so the two cannot drift apart. Measured after: the scroller ends 7px
above the dock on both a 320 and a 390 wide phone.

## 44px is the control, not the icon

The dock's icons are 20 to 24px, which is what you look at. What you hit is the
button around them, and MUI sizes that from the icon: a `fontSize="small"` icon
gave a 36px target, a default one 40, so the printer and the add-to-playlist
were the two smallest things on a screen otherwise made of 40s, four pixels
from their neighbours. Every control in the dock now grows its ripple to
`TOUCH` (44) whatever the icon inside measures.

**What paid for it was a word.** Six controls at 44 plus a key label that
reserves the width of "Tónina H#" come to more than a 390px phone has, so the
pill prints the note alone — between a `−` and a `+` it needs no caption, and it
is the same thing the playlist's rows show in their chips. The full phrase stays
as the label's `aria-label`. Measured after: every target 44×44, and the gaps
went 4/8/8/4 → 8/11/12/7 on a 390 phone, 15/15 → 28/28 on a 320 one.

The playlist deck's nav row had the same shape of problem the other way round:
the `‹` and `›` that step through the playlist are the most pressed controls on
that screen and were drawn `size="small"`, which is a 34px button. They are 44
now. The page dots keep their 7px of paint and sit inside a button a thumb
tall, which also takes the row's gap, so nothing between two dots is dead — 13
by 44 for a dot, 28 by 44 for the current one.

## A dock sheds controls before it overflows

Below 360px the song dock keeps the printer, the key and the ⋮, and moves the
heart and add-to-playlist into the ⋮. Six controls plus the key pill are wider
than the card, and `justify-content: space-between` does not shrink — it pushes
the last one out, so on a 320px screen the ⋮ ended 6px past the right edge of
the display, for signed-in visitors only (a signed-out dock has four controls
and fits).

The rule the dock follows: **a row that cannot shrink must drop items, and the
overflow menu is where they go.** Not a smaller gap, not a smaller icon.

## A sheet lists, it does not shelve — and it scrolls inside

The song picker (`SongSelectPopup` with `asSheet`) is the worked example, and
the shape is the rule for any sheet that offers a list to choose from.

**A sideways shelf of cards becomes rows.** The picker's cards are 150–180px
wide, so a phone showed two and a half of them and the rest lived past the right
edge of the sheet — an offering nobody knew was there, behind a gesture nothing
asked for. Stacked rows put all of it under each other, which is where a list is
read. Desktop keeps the cards: it has the width, and it is where the shelf makes
sense.

**A row of tabs that does not fit becomes a menu.** Three sources —
`Z globálního zpěvníku`, `Z mých písní`, `Z týmového zpěvníku` — are wider than
any phone, and a scrolling tab row cut the third one mid-word. One line,
`Zdroj: <the current one> ▾`, opens the house `Menu` with all three whole. The
word `Zdroj:` stays in the line on purpose: with no second tab beside it, that
label is the only thing saying the line can be switched. It costs one tap to
change source, and it survives a fourth source without a redesign.

**Chosen is a tint and a tick, not a border.** The desktop card marks its choice
with a 2px blue outline over a 10% blue fill. Rows are joined into one block by
their dividers and a border around one of them breaks the block apart, so the
row keeps the same blue at the same tenth, turns the title blue, and adds a tick
— the tick carrying the choice where the tint is too faint to (sunlight, dark
theme, a phone held at an angle). Same colour as the desktop, translated from a
card into a row; no checkboxes, which the app has nowhere else and which would
give a song list the look of a form.

**The list scrolls, not the sheet, and it stops at four rows.** A sheet tall
enough to hold rows is tall enough that scrolling it as a whole pushes its own
*Přidat vybrané* off the screen. The sheet is a flex column with
`overflow: hidden`; the list is the one part that scrolls
(`flex: 0 1 auto; min-height: 0; overflow-y: auto`), capped at four rows and a
slice of the fifth — enough to say there are more without the sheet swallowing
the screen, which hides what you were adding the song to. Heading, source and
buttons stay put at any scroll position.

**Build the rows out of `@/common/ui/GroupList`, not by hand.** `GroupCard` +
`SongVariantCard dense` (+ `GroupDivider`, `GroupRowsSkeleton`,
`ListStateView`) is the phone's list language, and the first draft of this
picker re-implemented it — tighter corners, full-bleed hairlines, its own
padding, no press feedback. One caveat found on the way: the card's own
`selectable` tints only its text column, which in a row leaves the leading tile
and the trailing icons outside the fill. For a full-row fill, disable the row's
link with `toLinkProps={() => null}`, take the click yourself, and put the tint
in `sx`.

## A sticky band stops short of the scroll indicator

A phone draws the list's scroll indicator *inside* the scroller, at its very
edge, and Chromium lets a positioned child paint over it. The catalog's search
band is sticky with a `z-index`, opaque, and bled to both edges — so the
indicator slid under it and the list lost its place marker every time it passed
the field.

Bleed to the left edge (a card sliding up under the band has to be covered all
the way out), but stop at the content edge on the right. The strip left bare is
the scroller's own 16px inset: no card reaches into it, and it is the same grey
as the band, so nothing about it shows. Home's band had the same shape and the
same fix.

The shell's own header is a sibling of the scroller rather than a child, so it
covers the top of the indicator too — but that is the top of the screen, where
a bar belongs. A band floating in the middle of the list is where it reads as
a fault.

## A backdrop stops below the bar

The Nástroje sheet closed on a tap anywhere, through a full-screen backdrop —
at a z-index above the tab bar, which is the one thing on the screen you reach
for next. So a tap on Písně bought nothing but the menu closing, and the tab
had to be pressed twice. Measured: with the sheet open, the element under the
middle of the bar was the backdrop (`DIV z=11`).

The backdrop sits at 9 now, under the dock's 10 and over the page, so the first
tap both closes the sheet and goes where it was aimed; arriving anywhere closes
the sheet on the way (an effect on the pathname), and the Nástroje tab itself
toggles. Any overlay whose job is "tap anywhere to dismiss" belongs under the
bar for the same reason — dismissing is not worth a tap of its own when the tap
already meant something.

## A backdrop is not a focus stop

Every dialog drew a thin orange frame around the whole screen. It was
Chromium's own focus ring: `Popup` gives its backdrop `id="popup-content"` and
focuses it on open, and the backdrop is the size of the viewport, so the ring
went round the edge of the phone. It was also in the tab order, one stop before
anything inside the dialog.

The backdrop keeps the focus — the popup wants somewhere to put it — but takes
`tabIndex={-1}` and `outline: 'none'`: programmatic focus still lands, the tab
order skips it, and nothing is painted around the screen. Anything that fills
the viewport to catch taps is scenery: give it `-1` and kill its outline, or
the browser will draw a border on your behalf.

## The shell remembers where each screen was left

The browser restores the *document's* scroll, and the shell scrolls a box of
its own, so it restored nothing: reading the catalog 450px down, opening a song
and coming back put you at the top of a screen you had already read.
`MobileAppHeader` keeps a position per pathname in module state — as long as
the tab lives and no longer, which is what a reload should forget.

Two things this needs that are easy to get wrong:

- **Recording and restoring are one effect, because they race.** The list is
  still arriving when the screen mounts, so the position is re-applied while
  the content grows under it; each attempt lands at 0 on a page that is still
  empty and fires a scroll event, which a separate recorder takes for the user
  scrolling to the top and writes over the very position being restored.
  Nothing is recorded until the restore is done, and a touch or a wheel ends it
  early, because from then the position is yours.
- **Re-apply per frame, not on a resize.** The rows grow deep inside the
  scroller, where a `ResizeObserver` on the box itself never hears about it —
  measured, that version reached 277 of 450 and stopped.

`scrollResetKey` now resets only when it *changes*, not when a screen mounts
holding one: a fresh mount is at the top anyway, and firing on mount wiped the
restored position a frame after it landed. Measured: back to the catalog
restores 450; a paginator page change and a search both still land at 0.

## A back arrow asks the app, not the browser

`←` has two right answers and has to tell them apart: go back where you came
from, or — arriving from outside on a shared link — go up to the screen this one
belongs to. Both places that decide this asked `window.history.state.idx`, which
is a **Pages Router** field. The App Router writes `__NA` and its own tree and no
`idx` at all, so:

- the playlist read the missing value as 0 and went up to Účet every single
  time, whatever screen you opened the playlist from;
- `MobileAppHeader` fell back to `history.length > 1`, which counts the pages of
  other sites this tab visited, and would walk you out of the app from a shared
  link (`history.length` is 2 on a cold load in a tab that has been used).

`routes/history/inAppHistory` answers it from what the app knows: it has
navigated if its own pathname has changed since the first paint, counted once
app-wide by a tracker in `AppClientProviders` (inside the subdomain-alias
provider — it reads the pathname through it). `hasInAppHistory()` is what both
back arrows ask now. Measured: playlist opened from the list → `←` →
/ucet/playlisty (was /ucet); playlist opened cold → `←` → /ucet; song opened
cold → `←` → /pisne.

## Back closes what is open before it leaves

A sheet is state, not a route, so Back — which people reach for to dismiss
things long before they use it to travel — took the whole page with it:
Nástroje open on the catalog, one Back, and you were on the home screen with
neither the sheet nor the catalog.

`common/hooks/useCloseOnBack` gives an overlay one history entry at its own URL
while it is open, carrying the router's own state so its bookkeeping is
untouched. Back pops that entry and the overlay closes instead. Closing any
other way takes the entry back out, so Back is never a dead press afterwards;
closing because the app navigated leaves it alone, since it is then a duplicate
of the page behind the new one, which is where Back should land anyway. Walked
through all three: Back on an open sheet stays put and closes it (a second Back
leaves as usual), a tap outside then Back leaves, a tab tap then Back returns to
where the sheet was opened.

**Taking the entry back out is the caller's move, never a cleanup.** The first
version popped it when the overlay's state went away, "unless we have moved" —
and every tool in Nástroje stopped working: pressing one closed the sheet and
stayed on the page it was opened from. The router changes the URL *after* the
React state has gone, so at cleanup time nothing had moved yet, the pop fired,
and it cancelled the navigation the press had just started. Measured, with
`history` instrumented: `push /pisne` on open, then `BACK from /pisne` ·
`popstate` · `replace /pisne` on the press — and never a push for the tool's
own route.

So the hook returns a `dismiss` instead. The ways of closing that mean "never
mind" — the backdrop, the tab that toggles the sheet — go through it and pop.
A press that navigates just closes, and leaves the entry to the page it is on
its way to. Anything that closes an overlay both ways needs the same two doors.

## A tab can open the desktop's own menu

The Účet tab jumped straight to `/ucet`, where the top bar on a desktop opens a
menu under the avatar — your name with "Spravovat účet", and "Odhlásit se". Two
different answers to the same tap, and no way to sign out from the phone at all
without first landing on a page.

It is the same component now: `AccountMenu`, rendered from the tab bar and
anchored to the Účet tab. Prefer this over a phone copy wherever the desktop
already has the menu — one place to change, and the two can't drift.

Three things a menu built for a top bar needs before it works on a bottom one,
all of them optional props so the desktop side is untouched:

- **`openUpwards`.** Hanging downwards from a tab at the bottom of the screen,
  the menu has nowhere to go, so MUI shoves it back up *over* the bar and
  covers the tabs it grew out of. Anchor `top` / transform `bottom` instead.
- **A backdrop that stops above the bar** (`MOBILE_NAV_CLEARANCE`), with
  `pointerEvents: 'none'` on the modal root and `'auto'` on the backdrop and the
  paper. MUI's backdrop covers the viewport, which is the same trap the Nástroje
  sheet was pulled out of: a tap on Písně would buy nothing but the menu
  closing. Measured both ways — with the plain backdrop Playwright reports
  `MuiBackdrop-root … intercepts pointer events` over the tab; with this, the
  tap lands on the tab.
- **`onDismiss` apart from `onClose`**, for the same reason the Nástroje sheet
  needs it: an item that navigates must not pop the overlay's history entry.
  Without it "Spravovat účet" closed the menu and stayed put.

Two sheets on one bar are one sheet: opening either closes the other, and both
close on arrival.

## A lit tab must not be a bigger tab

Opening the Účet menu nudged the whole bar two pixels up. Nothing about the
menu did it: the tab lights up while the menu is open, the Účet tab's ring
thickens from 1px to 2px to show it, and MUI's `Avatar` sizes its *content* —
so the ring was drawn outside the 25px it was given and the avatar went 27px →
29px, the row with it. Measured: the tab 48px tall and at y=604 closed, 50px
and y=602 open.

Give anything in the bar a fixed outer box (`boxSizing: 'border-box'`) and let
the state thicken inwards. A bar is the one thing on the screen that must be in
the same place before and after a tap; nothing in it may change size to say
something. Worth checking whenever an active state adds a border, a ring or a
weight, since the route-driven version of the same jump is invisible — you only
see it when the state flips under your thumb.

## A control that is not visible yet has no hit area

The collapsing header stages its parts by fading them. Fading leaves the element
in place, at full size, still taking taps — so the playlist's ⋮ was a 31×31
square of nothing in the corner that opened a menu, and the menu it opened held
Přejmenovat and Smazat, which is where they went to hide.

Two rules came out of it:

- **Morph the size, not only the opacity.** An item that belongs to the compact
  bar grows `width`/`height` from `0` with `overflow: hidden`, so before the bar
  exists there is nothing to press.
- **A control that only exists in one state of the header needs a home in the
  other.** The ⋮ is now in the expanded action row as well; both open the same
  menu. Anything that lives *only* behind a collapsed-state control is
  unreachable on a screen too short to scroll — which is every short playlist.

## Anything that leaves the app

**An installed app cannot hand the browser an address of its own.** Scope —
everything under `start_url`, and ours is `/` — is what the platform uses to
decide, and the printable PDF lives at `/pisen/…/pdf`, inside it. So
`target="_blank"` there does not mean "the browser takes this"; it means "open
another window of yourself", which on a phone has no address bar, no share
sheet and no print button. Swapping `window.open(url, '_blank', 'width=…')` for
a link was the same bug in a second costume, and it took a real iPhone to show
that, because in a browser tab there is no scope and both look fine.

**So don't navigate — download.** A download is not a navigation, so the app has
nothing to display: the file goes to the system, and on an iPhone that is the
share sheet, where printing actually lives. `printDocumentByUrl` does this when
`isStandalonePwa()` (`tech/device.tech.ts`) says we are installed, and keeps the
popup-and-`print()` behaviour in a browser tab.

Pass the file's name with it. An empty `download` does not fall back to the
response's `Content-Disposition` the way the spec reads — Chromium saves the
file as `download` — so every caller that knows the song's or playlist's title
passes it. The routes' header is correct now too (`contentDisposition`, RFC
6266: a `filename*=UTF-8''…` for the real name and an ASCII `filename` for
anything that cannot read it); percent-encoding the plain `filename`, which is
what they used to do, saved the file as `10%20000%20d%C5%AFvod%C5%AF.pdf`.

The only way to get a real browser tab would be to put the file outside the
app's scope — another host. That is infrastructure, not frontend.

## Where a button is declared

**Global navigation belongs to the tab bar, and nowhere else.** Account, tools,
search and create are always one tap away at the bottom, so a page must not
render them again in a top row — that is the same destinations twice, in two
visual languages. `RightAccountPanel` is the desktop toolbar's right side; it is
hidden below `MOBILE_NAV_BREAKPOINT` wherever a module reuses it.

**A page's own action is written once, where it belongs in the page**, wrapped
in `common/components/PageAction`:

```tsx
<PageAction>
  <Button endIcon={<PersonAdd />} onClick={openInvite}>{t('invite')}</Button>
</PageAction>
```

Declaration and usage are the same place on purpose: the page states what it can
do and does not also have to know where that lands. `PageAction` owns the
placement — inline on desktop, so existing layouts are untouched, and docked in
the strip above the tab bar on phones, within reach of the thumb. That strip is
the dock's `ABOVE_TABBAR_SLOT_ID`, the same slot the song dock and paginators
portal into, so it stacks by layout and follows the bar's height — and it is
there whichever bar has the dock, so a page's action works inside a team too.

This is what replaces a FAB: the rule against a bottom-right button competing
with the tab bar still holds, and the docked strip is where that pressure goes.

## Attention & layout rules

1. **Thumb zone = navigation only.** The bottom tab bar owns navigation, and
   every tab reads the same — search included (it is a tab, not a raised
   action). **Pages never add a competing bottom FAB.**
2. **One hero blue per zone.** Primary blue is the attention colour — spend it
   on the current-tab indicator + one primary action per zone. Everything else
   (pagination, sort, secondary actions) is **neutral** (grey / tonal).
   → paginators and control strips are never blue.
3. **Placement by frequency.** Frequent / primary → bottom (thumb reach).
   Occasional / contextual (create, sort, filter, in-list search, pagination)
   → top (header / controlPanel), or a quiet bottom panel.
4. **The bottom panel is quiet.** A `bottomPanel` (e.g. pagination) is
   low-contrast and neutral so it never competes with the tab bar, and sits
   **below** it in z-order.
5. **Don't stack shouters.** If two attention elements want the same spot,
   promote one and relocate / soften the other. Never stack several loud
   elements on top of each other.
6. **Consistent homes for actions.** Navigation → tab bar. A page's own create
   action → the header (a "+ Add" pill), **not** a FAB. Contextual controls →
   `controlPanel` at the top. Content navigation (pagination) → a quiet
   `bottomPanel`.
7. **A dock holds actions, not settings.** The song page's dock has room for a
   handful of controls; they go to what you reach for *while holding the phone*
   — printing, liking, the key, the playlist. A setting you turn on for the
   song you are about to play and then leave alone (the chords toggle) belongs
   in the options menu, where its item still says which way it is set.
   A menu opened from a dock opens **upward**, onto its button (`ABOVE_ANCHOR`,
   `common/components/Menu`): MUI's Popover does not flip, so with no room below
   it keeps the menu below the anchor and slides it back into the window — which
   put these menus 200px from their button, over the dock itself.
8. **A row that stands for several things carries them as a pile, not as a
   number.** A song with translations is one row on a card of its own, with the
   edges of the cards under it showing below (`SongGroupRow`) — the phone's
   reading of the desktop's stacked `SongGroupCard`. Tapping the row opens the
   one on top; tapping the pile opens the same chooser the desktop card opens.
   The pile needs the card: a row flush in a shared surface has no edge for
   anything to peek out from under. So in a list that can hold groups — search
   results — **every** result gets a card and the same light gap, rather than
   one surface with the grouped song cut out of it: a list where only that song
   is a card reads as though it had been singled out. Lists that cannot hold
   groups (home, browse, the account lists) keep the shared surface.
   **The pile's depth comes from `stackOffset`, the same curve the desktop card
   stacks on** — logarithmic, so the first card behind drops most of the way and
   each one after adds less. Spread the edges evenly and a pile of five reads as
   a staircase and pushes everything below it down the screen; on the curve it
   stands barely taller than a pile of two (15 / 19 / 21px for one, two and
   three edges). One function, both variants — the phone's pile is the desktop's
   pile drawn flat.
9. **Never a blank screen.** A data-backed screen always renders one of four
   states — **loading** (skeletons), **empty** (icon + message), **error**
   (icon + message + a "Zkusit znovu" retry), or the **content**. A page that
   shows only its header while data is missing is a bug: the user can't tell
   loading from broken. Match the states shown by `MobileSongListView` /
   `SongsMobile`.

## Applied (the standard)

- **Create actions** (Moje písně "Přidat", Playlisty "Nový") live in the
  header as a compact primary pill in `actions` — no FAB.
- **Pagination** uses the neutral (standard) MUI colour, pinned in a quiet
  `bottomPanel`.
- **Sort / filter** live in the `controlPanel` (segment) at the top.
  ⚠️ **Not wired yet.** `MobileAppHeader` accepts `controlPanel` but no account
  screen passes one, so the sort/filter columns in the table below describe the
  intended shape rather than what ships today. The desktop `*OrderSelect`
  components are already props-driven — pass them as `controlPanel` to close it.
- **Global search** is the catalog's own field, in its `controlPanel`; the tab
  bar's Hledat is a link to it (see "Search is a control, not a place").

Per-page shape:

| Screen | back | subtitle | header actions | controlPanel | bottomPanel |
|---|---|---|---|---|---|
| Účet | – | – | – | – | – |
| Oblíbené | → Účet | count | (in-list search) | sort | – |
| Moje písně | → Účet | count | **+ Přidat** | sort/filter | pagination |
| Playlisty | → Účet | count | **+ Nový** | sort | – |
| Písně (katalog) | – | – | – | **search field** (sticky band in the content, not a `controlPanel`) | – (floating paginator, browsing only) |
| Playlist detail | → back | Playlist · count | Tisknout (+ prezentace/share/rename/edit → ⋮) | (mode switch) | – |

**Collapsing hero condenses its actions — it doesn't hide them.** The
playlist detail page has its own collapsing header (not `MobileAppHeader`).
At rest the tall hero shows the full action row side by side — the blue
*Tisknout* primary plus prezentace / share / edit as inline circles. On scroll
(and in Detail mode, which opens already-slim) it condenses to the standard
app-bar form: **one primary + one `⋮`**, where the `⋮` overflow
(`common/components/Menu`) holds prezentace / share / rename / edit. So the ≤2-actions cap
applies to the *slim* bar; the expanded hero may show more. In edit mode the
slim `⋮` becomes a `✓` for a clear way out.

**Collapse = a scroll-driven morph over a fixed-overlay header, never a
height-animating flex header.** The header is built with the reusable
`common/components/CollapsingHeader` (`CollapsingHeader` + `MorphItem`):
elements present in both states travel/scale continuously to their target
(the title shrinks and moves into the bar; the *Tisknout* pill slides and
shrinks into its circle, its label collapsing via the `--collapse-p` CSS
variable), and elements that exist in only one state just fade
(cover/subtitle/share/print/edit out, `⋮` in). Declare each with `from`/`to`
style specs; the component interpolates them by scroll progress.

**The header's hairline belongs to the bar, not to the hero.** The collapsing
header drew a 1px line along its bottom edge at every scroll position, which in
the expanded state lands immediately above the first card of the list and cuts
the screen in two for nothing — the hero and the list read as one block. It is
painted with the shadow instead, both only once the header has become a bar
with content sliding under it (`p > 0.96`).

**A reserve for the compact bar interpolates too.** The playlist's title was
capped at `calc(100vw - 210px)` at every scroll position — room held for the
Tisknout circle, the `⋮` beside it and the pill travelling up to them. None of
those are on the title's line while the header is open, so a name was cut at
180px of a 390px phone with 114px of empty header next to it. Anything sized
around a control that only exists further into the collapse belongs in
`var(--collapse-p)` like the rest of the header
(`calc(100vw - 104px - min(1, var(--collapse-p, 0) / 0.45) * 100px)`): open
wide, tightening by the time the pill crosses the line. Measure the crossing —
the pill reaches the title's band around 45% and is the binding neighbour until
about 75%, not the `⋮`.

Why an overlay + a top spacer rather than a header that shrinks in the flex
column: shrinking a real header hands its height back to the scroller, which
shrinks the remaining scroll distance and makes short/medium lists stick
part-way collapsed (only very long lists have the slack to finish). Here the
header is an absolute overlay (the scroller's height never changes → no
feedback loop) and the room it gives back is a `expandedHeight`-tall spacer at
the top of the scroll content that scrolls away under the header — so it
condenses reliably for any list length and leaves no dead space at the end.
