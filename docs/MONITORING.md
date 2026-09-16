# Monitoring, logování chyb a analytika

## Sentry

Chyby se hlásí do [Sentry](https://sentry.io). Bez nastaveného
`NEXT_PUBLIC_SENTRY_DSN` je Sentry vypnuté a všechna volání jsou no-op.

### Env proměnné

| Proměnná | Povinná | Popis |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | ne | DSN projektu ze Sentry. Bez ní se nic neposílá. |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | ne | Název prostředí. Default je `NODE_ENV`. |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | ne | Jen pro upload source maps při buildu. Bez tokenu se upload přeskočí. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | ne | Podíl běžných sessions se Session Replay nahrávkou (0–1). Default `0.1`. |
| `NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE` | ne | Podíl sessions s chybou, které se nahrají (0–1). Default `1`. |

Inicializace: `sentry.client.config.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts` (root) + `src/instrumentation.ts`. Build obaluje
`withSentryConfig` v `next.config.mjs`.

Pozor: `NEXT_PUBLIC_SENTRY_DSN` se do bundlu zapéká **při buildu** — DSN
nastavená až za runtime nic nezapne. Produkční CI
(`production-deployment.yml`) nepředává žádné build argumenty: kopíruje
`.env` soubory z deploy serveru (`/root/worshiptool/<web>/frontend/.env`)
do build kontextu a Dockerfile na ně spadne zpátky. Sentry proměnné tedy
patří do těchto souborů. Build argumenty v `Dockerfile` /
`docker-compose.yml` slouží pro lokální a manuální buildy.

Performance tracing je vypnutý a příslušný kód SDK se při buildu
tree-shakuje (`webpack.treeshake.removeTracing` v `next.config.mjs`), aby
Sentry nezvětšovalo klientský bundle víc, než je nutné. Pro zapnutí
tracingu odstraň `removeTracing` a nastav `tracesSampleRate`
v `sentry.*.config.ts`.

### Co se hlásí

- **Error boundaries** — `src/app/error.tsx`, `src/app/global-error.tsx`
  a `src/common/components/app/ErrorBoundary.tsx` posílají zachycené render
  chyby do Sentry (tag `errorBoundary` říká, která vrstva chybu chytla).
- **API chyby** — `handleApiCall` (client) hlásí odpovědi 5xx,
  `handleServerApiCall` (server) hlásí 5xx i síťové chyby směrem na backend.
  Očekávané klientské chyby (401/403/404) se nehlásí.
- **Server chyby** — `logServerError()` posílá do Sentry.
- **React Server Components** — na Next 14 přes build-time wrapping
  komponent (`withSentryConfig`); export `onRequestError`
  v `src/instrumentation.ts` se aktivuje až po upgradu na Next 15.

Browserové eventy jdou přes first-party tunel `/monitoring`
(`tunnelRoute` v `next.config.mjs`), takže je neblokují ad-blockery.
Cesta je vyjmutá z middleware matcheru v `src/middleware.ts`.

### Session Replay

Session Replay je zapnutý v `sentry.client.config.ts`. Defaultně se nahrává
10 % běžných sessions a 100 % sessions, ve kterých nastala chyba; sample
raty jdou přepsat env proměnnými (viz tabulka výše) — stejně jako DSN se
ale zapékají při buildu. Replay eventy jdou přes tunel `/monitoring` jako
ostatní eventy.

Nahrávky používají privacy defaulty SDK: veškerý text je maskovaný
(`maskAllText`) a média blokovaná (`blockAllMedia`). Pokud bude potřeba
v nahrávkách vidět obsah (např. texty písní), lze to povolit v opcích
`Sentry.replayIntegration()`.

Replay integrace zvětšuje klientský bundle (řádově desítky kB gzip) —
je součástí `sentry.client.config.ts`, ne dynamického importu.

Vedle Sentry běží nezávisle i session replay přes Statsig
(`FeatureFlagsProvider.tsx`).

## Analytika (Mixpanel)

Eventy se trackují přes typovaný facade
`src/app/components/components/analytics/analytics.tech.ts`:

```ts
Analytics.track('VISIT_SONG', { songGuid, packGuid, title, hasChords })
```

Nový event přidáš rozšířením `AnalyticsTrackData`
v `analytics.types.ts` — název i payload jsou pak typově kontrolované.

### Aktuálně trackované eventy

| Event | Kde se posílá |
| --- | --- |
| `VISIT_SONG` | zobrazení písně (`SongAnalyze.tsx`) |
| `SEARCH` | vyhledávání po debounce, deduplikované proti poslednímu dotazu (`SearchedSongsList.tsx`) |
| `SMART_SEARCH_TOGGLE` | přepnutí smart search (`MainSearchInput.tsx`) |
| `LOGIN` / `SIGNUP` / `LOGOUT` | auth flow (`useAuth.tsx`), `method` rozlišuje heslo/Google; `LOGOUT.reason` rozlišuje odhlášení uživatelem vs. expiraci session |
| `CREATE_PLAYLIST` | osobní playlist (`usePlaylistsGeneral.ts`, `source: 'personal'`) i týmový (`TeamNewPlaylistButton`, `UsersTeamPlaylistsAddButton`, `source: 'team'`) |
| `ADD_SONG_TO_PLAYLIST` / `REMOVE_SONG_FROM_PLAYLIST` | práce s playlistem (`usePlaylistsGeneral.ts`) |

Poznámky k interpretaci dat:

- Registrace heslem automaticky přihlásí — po `SIGNUP` vždy následuje
  `LOGIN {method: 'password'}`. Google účty `SIGNUP` neposílají (první
  přihlášení je rovnou `LOGIN {method: 'google'}`).
- Hromadné přidání N písní do playlistu pošle N eventů
  `ADD_SONG_TO_PLAYLIST` (jeden na píseň).
- V development režimu se Mixpanel neinicializuje, lokální vývoj tedy
  data neznečišťuje. E2E testy běžící proti nasazenému dev prostředí
  (dev.chvalotce.cz) ale eventy posílají.

Identifikace uživatele (identify + people.set) probíhá
v `MixPanelAnalytics.tsx` po přihlášení.
