# Home Page (Úvodní stránka)

## Přehled

Úvodní stránka byla kompletně předesignována v březnu 2026. Nový design používá editorial/warm estetiku s tmavým hero sekce a teplým krémovým obsahem.

## Architektura

```
src/app/components/home/
├── HomeDesktopNew.tsx          # Hlavní komponenta (orchestruje vše)
├── HomeDesktop.module.css      # CSS Module pro celou stránku
├── HomeSearchBar.tsx           # Vyhledávací lišta v hero sekci
├── QuickSearchTags.tsx         # Rychlé tagy pro vyhledávání
├── SongIdeasSection.tsx        # Sekce s doporučenými písněmi
├── RecentlyAddedSection.tsx    # Sekce s nedávno přidanými písněmi
├── BrowseAllBanner.tsx         # CTA banner pro procházení zpěvníku
└── __tests__/
    ├── HomeDesktopNew.test.tsx
    ├── HomeSearchBar.test.tsx
    └── QuickSearchTags.test.tsx
```

## Layout integrace

- Stránka používá `SmartPage` s `fullWidth: true` a `hidePadding: true` pro plnou šířku
- Celý obsah je obalen v `.pageWrapper` s `min-height: 100vh` — zakrývá globální šedé pozadí
- Hero sekce používá `margin-top: -56px` aby gradient šel až za transparentní toolbar
- Toolbar je nastaven na `transparent: true` a `whiteVersion: true` pro bílý text nad tmavým hero
- Mezi hero a obsahem je `.heroToContentTransition` — plynulý gradient přechod z tmavé do krémové
- Obsahová oblast (`#fbf8f4`) roste přes `flex: 1` aby vyplnila zbývající výšku viewportu

## Sekce stránky

### 1. Hero sekce
- Tmavý gradient pozadí (#0f0f1a → #2d1b4e)
- Jemný noise texture overlay
- Radiální gradient akcentní světla
- Název aplikace s animací (framer-motion)
- Podtitulek

### 2. Vyhledávání (HomeSearchBar)
- Pill-shaped input s glassmorphism efektem
- Podpora smart search (embedding-based, feature-flagged)
- Auto-focus při načtení

### 3. Quick Search Tags (QuickSearchTags)
- Klikatelné tagy: Uctívání, Chvály, Žalmy, Vánoce, Velikonoce, Svatba
- Po kliknutí se předvyplní vyhledávání
- Staggered animace při načtení

### 4. Nápady na písně (SongIdeasSection)
- Grid 4 karet (responsive: 2 na tabletu, 1 na mobilu)
- Data z `useRecommendedSongs` hook
- Ukázka prvních řádků textu
- Skeleton loading stavy

### 5. Nedávno přidané (RecentlyAddedSection)
- Seznam 8 posledních přidaných písní
- Data z `useLastAddedSongs` hook
- Číslovaný seznam s datem přidání
- Staggered slide-in animace

### 6. Banner procházení (BrowseAllBanner)
- CTA pro přechod na `/seznam`
- Tmavý gradient s radiálním akcentem

## Překlady

Nové klíče v `content/*.json`:
- `home.quickTags.*` — popisky rychlých tagů
- `home.songIdeas.*` — sekce nápadů
- `home.recentlyAdded.*` — sekce nedávno přidaných
- `home.browseBanner.*` — CTA banner

## Zpětná kompatibilita

- `HomeDesktop.tsx` re-exportuje novou komponentu
- `RESET_HOME_SCREEN_EVENT_NAME` stále exportován pro `LogoTitle`
- Existující `SearchedSongsList` a `FloatingAddButton` jsou znovupoužity
