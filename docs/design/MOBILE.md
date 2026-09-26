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

Why an overlay + a top spacer rather than a header that shrinks in the flex
column: shrinking a real header hands its height back to the scroller, which
shrinks the remaining scroll distance and makes short/medium lists stick
part-way collapsed (only very long lists have the slack to finish). Here the
header is an absolute overlay (the scroller's height never changes → no
feedback loop) and the room it gives back is a `expandedHeight`-tall spacer at
the top of the scroll content that scrolls away under the header — so it
condenses reliably for any list length and leaves no dead space at the end.
