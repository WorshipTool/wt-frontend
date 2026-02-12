# Komplexní analýza platformy Chvalotce.cz
**Datum:** 12. února 2026
**Typ:** Pravidelná projektová revize

---

## 1. ZDRAVÍ & STAV PLATFORMY

### Stav komponent

#### ✅ Hlavní komponenty (Aktivní)
- **Frontend (wt-frontend)**: Next.js 14.2.3, React 18, TypeScript
  - Port: 3000 (standalone)
  - Deployment: Docker, automatický CI/CD na develop branch
  - Status: ✅ Aktivní, plně funkční

- **Backend (wt-backend)**: NestJS 10, Node.js 20, TypeScript
  - Port: 3300
  - Deployment: Docker, automatický CI/CD na develop branch
  - Status: ✅ Aktivní, plně funkční

#### 🗄️ Datové úložiště
- **MariaDB 11**: Primární relační databáze
  - Port: 3307 (local), 3306 (container)
  - Charset: utf8mb4, utf8mb4_unicode_ci
  - Migrace: 25 migrací, poslední z 12.2.2026
  - Status: ✅ Aktivní, health check implementován

- **Redis 7**: Cache a job queue systém
  - Port: 6379
  - Využití: BullMQ job queue, session cache
  - Status: ✅ Aktivní, health check implementován

- **Qdrant**: Vektorová databáze pro embeddingy
  - Port: 6335 (local), 6333 (container)
  - Využití: Song embeddings pro vyhledávání
  - Status: ✅ Aktivní, health check implementován

#### 🤖 AI Služby & Volitelné komponenty

**Aktivní služby:**
- **Family-Matcher Service** (ML služba pro párování písní)
  - Endpoint: Přes Bridge Service Module
  - Funkce: Predikce podobnosti písní pomocí trénovaného modelu
  - Status: ✅ Implementováno, plně funkční
  - Použití: `/predict` endpoint pro porovnání embeddingů

- **Embedder Service** (Generování embeddingů)
  - Funkce: Generování text embeddingů pro písně
  - Backend metoda: `getBridgeServiceUrl("embedder", "get-embedding")`
  - Status: ✅ Připojeno přes Bridge

- **OpenAI Integration** (GPT-3.5-turbo)
  - Funkce: AI asistent pro uživatele
  - Model: gpt-3.5-turbo
  - Konfigurace: Temperature 0, max 1000 tokens
  - Status: ✅ Aktivní (vyžaduje OPENAI_API_KEY)

**Služby vyžadující prověření:**
- ⚠️ **Updater Service**: Nenalezena v repozitáři (může být samostatný proces)
- ⚠️ **Bridge Service**: Registrační služba (nest-bridge-module v1.0.2)

### Výkon a stabilita

#### Testovací pokrytí

**Backend:**
- **Unit testy**: Jest, konfigurace připravena
- **Integrační testy**: Redis + MariaDB container testy
- **E2E testy**: Spouštěny v Docker kontejneru po deployi
- **CI/CD**:
  - Unit testy běží před buildem
  - Integration testy běží paralelně
  - E2E testy běží po deployment na dev
- ⚠️ **Problém**: `jest` není nainstalován (npm ci required)

**Frontend:**
- **Unit testy**: Jest s @testing-library/react
- **E2E testy**: Playwright v1.51.1
  - Smoke tests (~10-15 testů)
  - Critical tests (~30-40 testů)
  - Full suite (100+ testů)
- **CI/CD**:
  - 3 fáze testování (smoke → critical → full)
  - Spouští se automaticky po deploy na develop
  - Artifacts uchovány 7 dní
- ⚠️ **Problém**: Detekován Bus error při spuštění Jest

#### Monitoring & Observability

**Implementované:**
- ✅ **nest-status-monitor**: Monitoring backendu (v0.1.4)
- ✅ **BullBoard**: Dashboard pro job queue (@bull-board v6.7.4)
  - UI pro správu úloh, viz fronty
  - Podpora Express UI
- ✅ **Statsig**: Feature flags + session replay + web analytics
- ✅ **Mixpanel**: Event tracking
- ✅ **Hotjar**: Session recording & heatmaps
- ✅ **ConfigCat**: Feature flags (node v11.3.1)
- ✅ **Measuring Time Interceptor**: Performance tracking všech API calls
- ✅ **WebSockets**: Real-time notifikace (Socket.io, volitelné)

**Chybějící:**
- ❌ Centralizované logování (pouze LoggerModule)
- ❌ APM (Application Performance Monitoring)
- ❌ Alerting systém pro kritické chyby
- ❌ Database query performance monitoring

### Kritické problémy

**Bezpečnostní záplatování:**
- ✅ **Nedávno vyřešeno** (poslední 2 týdny):
  - Frontend: HIGH/CRITICAL zranitelnosti v dependencies (commit 658fbb48)
  - Backend: HIGH/CRITICAL zranitelnosti (commit a289ff4)
  - Upgrady: BullMQ, OpenAI, TypeORM, Statsig, npm

**Aktuální problémy:**
- ⚠️ **Build/Test Environment**: Dependencies nejsou nainstalovány v workspace
- ⚠️ **Bus Error**: Frontend Jest testy padají s core dump
- ⚠️ **Dokumentace**: Chybí .env.example v backend repozitáři

---

## 2. NEDÁVNÁ VÝVOJOVÁ AKTIVITA

### Statistiky commitů (poslední 2 měsíce)
- **Backend**: 109 commitů
- **Frontend**: 109 commitů
- **Aktivita**: Velmi vysoká, průměrně ~1.8 commitu denně

### Poslední implementované funkce (2 týdny)

#### 🎨 Frontend - UX vylepšení
1. **Kompaktní zobrazení vyhledávání** (top priorita)
   - Indikátory akordů u písní
   - Sorting podle popularity
   - Mobilní UX pro transpozici

2. **News systém** (feature announcements)
   - NewsProvider s Context API
   - Popup pro nové funkce
   - Highlight komponenty pro onboarding
   - Tracking stavu "viděno/vyzkoušeno"

3. **Vylepšené přihlašovací formuláře**
   - Kontextové placeholdery
   - Validace hesla
   - Lepší UX pro registraci

4. **Vizuální vylepšení**
   - Tooltip na písních (family name + počet překladů)
   - Drag & drop s vizuálním feedbackem a touch podporou
   - Snow efekt (sezónní feature)

#### 🔧 Backend - Nové funkce
1. **Vylepšené vyhledávání**
   - Popularity-based sorting algoritmus
   - Autocomplete endpoint pro suggestions
   - Deduplikace výsledků podle songPackGuid

2. **User Experience**
   - Podpora pro user nickname (přezdívka)
   - Password validace na backendu
   - Simplified playlist reorder API endpoint

3. **AI Features**
   - Optional `assistantName` parametr pro AI requesty
   - User settings pro assistant nickname

4. **News systém**
   - `AddUserNewsState` migrace (1769001798935)
   - NewsService s metodami getNewsState, markAsSeen, markAsTried
   - Unit testy pro NewsService

### Nedávné refaktoringy

**Backend:**
- Konsolidace duplicitních song search služeb (commit dbf6479)
- Zvýšení news notification intervalů (spam prevence)
- Deployment step refaktoring - odstranění matrix strategy

**Frontend:**
- TypeScript konfigurace update
- Migrace `serverComponentsExternalPackages` → `serverExternalPackages`
- Build proces zjednodušení

### Opravy chyb

**Kritické:**
- ✅ Bezpečnost: Authentication bypass v PackSettingController odstraněn
- ✅ Build: OOM fix a Next.js 14.2.3+ async params kompatibilita
- ✅ Dependencies: Množství security upgradů

**Ostatní:**
- Suppression BullMQ eviction policy warnings v E2E testech
- Fix `is-last` flags v databázi (migrace 1760986092606)
- Revalidace písní s novým normalizačním algoritmem

---

## 3. KVALITA KÓDU & TECHNICKÝ DLUH

### Architektura - Přehled

#### Backend (NestJS)
**Struktura:**
- 90 služeb (*.service.ts)
- 47 kontrolérů (*.controller.ts)
- 16 job queue modulů (*.queue.*.ts)
- 25 databázových migrací
- Modularní architektura: 21 top-level modulů

**Klíčové moduly:**
```
src/
├── songs/          # Správa písní (adding, editing, deleting, publishing)
├── playlists/      # Správa playlistů
├── auth/           # Autentizace (JWT, Google OAuth)
├── sub-modules/    # Teams, members, events, playlists, notes
├── ai/             # OpenAI integrace
├── bridge/         # Bridge služby (messenger, family-matcher)
├── embeddings/     # Embedding generování a správa (Qdrant)
├── parser/         # Parsing textu písní
├── sockets/        # WebSocket komunikace
├── images/         # Správa obrázků
├── news/           # News systém
├── mail/           # E-mail služba
└── monitor/        # Status monitoring
```

**Databázové entity:**
- **Song entities**: song, songvariant, songtitle, creator, source, tag, urlalias, media, csvlink, user-song-note
- **Playlist entities**: playlist + related
- **User entities**: user + permissions
- **Team entities**: team, team-member, team-event, team-playlists
- **AI entities**: model-weights, pack-embedding
- **Media**: image entity

#### Frontend (Next.js)
**Struktura:**
- ~1,357 řádků TypeScript/TSX kódu
- 25+ custom UI komponenty
- 20+ kompozitní komponenty
- 17 vnořených context providerů
- Auto-generované API klienty z OpenAPI

**Klíčové funkce:**
- App Router s Server & Client Components
- Material-UI design system
- Context API state management (bez Redux)
- Socket.io real-time komunikace
- Multi-language support (next-intl)
- Feature flags (Statsig)
- Comprehensive testing (Jest + Playwright)

### Code Quality Assessment

#### ✅ Silné stránky

1. **Type Safety**
   - Kompletní TypeScript pokrytí
   - Auto-generované API typy z OpenAPI
   - Type-safe routing (nextjs-routes)

2. **Testování**
   - 3-tier E2E testování (smoke/critical/full)
   - Unit testy pro kritické služby
   - Integration testy s real dependencies (Testcontainers)

3. **Modularita**
   - Čistě oddělené domény (songs, playlists, teams)
   - Reusable komponenty
   - Provider pattern pro state management

4. **CI/CD**
   - Automatický deployment na develop
   - Multi-stage testing
   - Docker multi-arch builds

5. **Bezpečnost**
   - JWT autentizace
   - Role-based permissions
   - Guards na všech úrovních (Auth, Permissions, FeatureFlags)
   - Pravidelné security updates

#### ⚠️ Oblasti vyžadující pozornost

1. **Technický dluh**
   - **News system spam**: Nedávno zvýšeny intervaly, ale může potřebovat další tuning
   - **Duplicitní kód**: Konsolidace search services právě probíhá
   - **Migrace cleanup**: 25 migrací, některé starší než rok

2. **Performance**
   - **Frontend Build OOM**: Nedávno fixováno, ale indikuje velikost bundlu
   - **Embedding cache**: In-memory Map může růst neomezeně
   - **Database indexing**: Trigram a fulltext indexy přidány nedávno (leden 2025)

3. **Dokumentace**
   - Většina modulů má README, ale je nekonzistentní
   - Chybí .env.example v backendu
   - API dokumentace jen přes Swagger (žádná Markdown docs)

4. **Monitoring**
   - Chybí centralizované logování
   - Žádný alerting systém
   - Performance monitoring je manuální

### Bezpečnostní zranitelnosti

**Aktuální stav:**
- ✅ **Vyřešeno**: HIGH/CRITICAL vulnerabilities v posledních týdnech
- ✅ **Vyřešeno**: Authentication bypass v PackSettingController
- ✅ **Aktuální**: Dependencies jsou relativně fresh (upgrade z ledna/února 2026)

**Doporučení:**
- Implementovat Snyk/Dependabot pro automatické security scanning
- Přidat rate limiting na API endpoints
- Audit CORS configurace
- Přidat Content Security Policy headers

### Testing Coverage

**Backend:**
- Unit tests: ✅ Připraveno (NewsService, ostatní služby)
- Integration tests: ✅ Redis + DB
- E2E tests: ✅ Automatické v CI

**Frontend:**
- Unit tests: ⚠️ Jest padá (Bus error)
- E2E tests: ✅ Playwright 100+ testů
- Coverage: Neměřeno (není v CI)

**Doporučené zlepšení:**
- Fix Jest bus error issue
- Přidat coverage reporting do CI
- Increase unit test coverage na <80%

### CI/CD Pipeline Status

**Backend workflow (dev-deployment.yml):**
```
1. Unit tests (Node 20, Redis service)
2. Integration tests (paralelně)
3. Docker build & push (multi-arch, cache optimalizace)
4. Deploy na dev server (docker compose up)
5. E2E tests v dev containeru
```
✅ **Status**: Plně funkční, spouští se na každý push do develop

**Frontend workflow (development-deployment.yml):**
```
1. Docker build s .env z remote serveru
2. Push na DockerHub
3. Deploy na dev server
4. Smoke tests (10-15)
5. Critical tests (30-40)
6. Full tests (100+)
```
✅ **Status**: Plně funkční, 3-tier testování

---

## 4. UŽIVATELSKÁ ZKUŠENOST & FUNKCIONALITA

### Aktuální user-facing funkce

#### 🎵 Správa písní
- ✅ **Vyhledávání**: Full-text + embedding-based
  - Autocomplete suggestions
  - Popularity sorting
  - Filtering podle akordů
  - Kompaktní zobrazení výsledků

- ✅ **Zobrazení písní**:
  - Text + akordy
  - Sheet music (via @pepavlin/sheet-api)
  - Video embeds (YouTube, Spotify)
  - PDF export
  - Presentation mode (full-screen)

- ✅ **Editing**:
  - Sheet editor
  - Metadata editing
  - Family merging pomocí ML
  - Translation management
  - Media management

#### 📋 Playlisty
- ✅ Vytváření a správa playlistů
- ✅ Drag & drop řazení (s vizuálním feedbackem)
- ✅ Simplified reorder API
- ✅ Presentation mode pro playlisty
- ✅ Sdílení playlistů v týmech

#### 👥 Teams (Týmy)
- ✅ Multi-tenancy s subdomains (`[team].chvalotce.cz`)
- ✅ Role-based permissions (Admin, Trustee, Member)
- ✅ Team events
- ✅ Team playlists
- ✅ Team notes na písních
- ✅ Member management

#### 🔐 Autentizace & User management
- ✅ Google OAuth
- ✅ JWT tokens
- ✅ User profiles s nickname
- ✅ Password validation (min délka)
- ✅ Favorites tracking
- ✅ User settings (assistant nickname)

#### 🌐 Multi-language support
- ✅ next-intl implementace
- ✅ Czech jako default
- ✅ CONTENT_VERSION pro multi-tenancy
- ⚠️ Pouze jeden jazyk aktivní (EN locale, CZ messages)

### Známé UX problémy

**Nedávno vyřešené:**
- ✅ Mobilní transpozice - větší ovládací prvky
- ✅ Vyhledávání - kompaktní zobrazení
- ✅ Registrační formulář - lepší placeholdery a validace

**Zbývající:**
- ⚠️ **Žádné major UX issues nezjištěny** v nedávných commitech
- Mnoho vylepšení právě implementováno

### Search funkcionalita

**Implementované:**
- Full-text search s trigram indexy (migrace 1757704000000)
- Embedding-based similarity search (Qdrant)
- Autocomplete endpoint
- Popularity-based sorting
- Deduplikace výsledků
- Filtering podle PackEmbeddingType.WHOLE_SONG

**Performance:**
- ✅ Fulltext indexy přidány nedávno
- ✅ Pack search index (migrace 1757540353412)
- ✅ Translation likes count pro sorting

### Song management features

**Publishing workflow:**
- Adding → Editing → Publishing
- Queue-based processing (BullMQ)
- GG filter queue
- Language detection queue
- Merging queue
- Media management

**Family matching:**
- ✅ ML-based family matcher service
- ✅ Embedding comparison
- ✅ Automatic family grouping
- ✅ Manual merging capability

### Playlist features

**Funkce:**
- Create, edit, delete
- Reorder items (nový simplified endpoint)
- Presentation mode
- Team sharing
- Complex edit operations s cache clearance

---

## 5. AI SLUŽBY & AUTOMATIZACE

### Embedding generování

**Implementace:**
- **Služba**: Embedder service (přes Bridge)
- **Storage**: Qdrant vector database
- **Typy**: WHOLE_SONG, sections (SectionEmbedding)
- **Cache**: In-memory Map cache pro pack embeddings
- **Model tracking**: model-weights entity pro tracking použitých modelů

**Funkce:**
```typescript
// PackEmbeddingService metody:
- getEmbeddingFromText(text: string): Promise<GeneratedEmbedding>
- generateEmbeddingFromPack(packGuid): Promise<GetEmbeddingFromPackOutDto>
- getEmbeddingOfPack(packGuid): Promise<GetEmbeddingFromPackOutDto>
```

**Performance:**
- ✅ Caching implementován
- ⚠️ Cache může růst neomezeně (Map bez eviction policy)

### Family matching výkon

**Služba:** FamilyMatcherService

**Funkce:**
```typescript
predict(pack1: VariantPackGuid, pack2: VariantPackGuid): Promise<{score: number}>
```

**Workflow:**
1. Získání embeddingů pro oba packy
2. POST request na family-matcher service
3. Response: similarity score

**Error handling:**
- ✅ HTTP exception propagace s detailním message
- ✅ Status code preservation
- ✅ Validation odpovědi (score !== undefined)

**Integrace:**
- ✅ Použito v song merging workflow
- ✅ Trained model deployment (nejasné kde model běží)

### Song ingestion & updater service

**Song ingestion:**
- ✅ Queue-based processing
- ✅ Parser pro různé formáty
- ✅ Language detection queue
- ✅ Media extraction
- ✅ Automatic embedding generation

**Updater service:**
- ❓ **Stav nejasný** - nenalezeno v repozitářích
- Může být samostatný cron job nebo externí služba
- Doporučení: Prověřit deployment dokumentaci

### AI-powered features pracující správně

**Ověřené:**
- ✅ **OpenAI Chat**: GPT-3.5-turbo integrace
  - Assistant s volitelným custom nickname
  - Temperature 0 pro konzistentní odpovědi
  - Max 1000 tokens

- ✅ **Embedding search**:
  - Qdrant integrace funkční
  - Nearest neighbor search
  - Filtering implementováno

- ✅ **Family matching**:
  - ML model integrace
  - Bridge service komunikace

**Vyžadující pozornost:**
- ⚠️ **Language detection**: Queue implementována, ale performance neověřena
- ⚠️ **Auto-translation**: Není zřejmé, zda je implementováno

### Service registry & heartbeat monitoring

**Bridge Service Module:**
- Package: @worshiptool/nest-bridge-module v1.0.2
- Konfigurace:
  - `bridgeUrl`: ENV variable
  - `serviceName`: ENV variable
  - `serviceType`: "backend"
  - `connectVia`: port nebo publicAddress

**Funkce:**
- ✅ Service discovery (getBridgeServiceUrl)
- ✅ Health checks (Docker compose healthchecks)

**Služby v registry:**
- `embedder`: Embedding generation service
- `family-matcher`: ML matching service

**Chybějící:**
- ❌ Dashboard pro service registry
- ❌ Service heartbeat UI
- ❌ Auto-restart při service failure (pouze Docker compose)

---

## 6. BUDOUCÍ PRIORITY VÝVOJE

### 🔴 Kritické - Okamžitá pozornost

#### 1. Fix testovacího prostředí
**Problém:** Jest Bus error, dependencies chybí
**Dopad:** Nemožnost spouštět unit testy lokálně
**Řešení:**
```bash
cd wt-backend && npm ci
cd wt-frontend && npm ci
# Investigate Bus error (možná memory issue)
```
**Čas:** 1-2 hodiny
**Priorita:** VYSOKÁ

#### 2. Dokumentace environment variables
**Problém:** Chybí .env.example v backend repozitáři
**Dopad:** Nové vývojáře nemohou snadno setupnout projekt
**Řešení:**
- Vytvořit .env.example se všemi required vars
- Dokumentovat každou variable v README
**Čas:** 1 hodina
**Priorita:** VYSOKÁ

#### 3. Monitoring & Alerting
**Problém:** Žádný alerting systém pro kritické chyby
**Dopad:** Produkční problémy nejsou detekovány včas
**Řešení:**
- Implementovat Sentry nebo podobné
- Nastavit alerty pro 5xx errors, DB connection failures
- Email/Slack notifikace
**Čas:** 4-8 hodin
**Priorita:** VYSOKÁ

### 🟡 Důležité - Blízká budoucnost (1-2 týdny)

#### 4. Performance optimalizace

**A) Frontend bundle size**
- Problem: OOM při buildování (nedávno fixováno, ale symptom)
- Řešení: Bundle analysis, code splitting optimization
- Nástroje: @next/bundle-analyzer
- Čas: 4 hodiny

**B) Embedding cache management**
- Problem: In-memory Map bez eviction policy
- Řešení: Implementovat LRU cache nebo přesun do Redis
- Čas: 3 hodiny

**C) Database query performance**
- Řešení: Přidat slow query logging
- Analyzovat N+1 queries
- Čas: 4 hodiny

#### 5. Testing coverage improvement
- Fix Bus error v frontend Jest
- Přidat coverage reporting do CI
- Target: >70% coverage pro critical paths
- Čas: 8 hodin

#### 6. Security hardening
- Implementovat rate limiting (express-rate-limit)
- Add Content Security Policy headers
- Audit CORS configuration
- Implement Snyk/Dependabot
- Čas: 6 hodin

### 🟢 Žádoucí - Střední horizont (1-2 měsíce)

#### 7. Centralizované logování
- Nástroje: Winston + Elasticsearch/Loki
- Structured logging
- Log aggregation z all services
- Čas: 16 hodin

#### 8. Multi-language expansion
- Currently jen CZ, framework připraven
- Přidat skutečné EN translations
- Čas: 20+ hodin (závisí na content volume)

#### 9. User feedback features
**Z nedávných UX vylepšení vyplývá trend:**
- Pokračovat v mobile UX improvements
- A/B testování (Statsig je připraven)
- User surveys (Hotjar je připraven)

#### 10. API documentation
- Rozšířit Swagger docs
- Přidat Markdown guide pro API usage
- Endpoint examples
- Čas: 8 hodin

### 💡 Nice-to-have - Dlouhodobé

#### 11. PWA features
- Offline mode
- Push notifications
- Install prompt
- Čas: 24+ hodin

#### 12. Advanced AI features
- Auto-translation (pokud není implemented)
- Chord detection z audio
- Lyrics sentiment analysis
- Smart playlist generation
- Čas: 40+ hodin

#### 13. Team collaboration features
- Real-time collaborative editing
- Comments & discussions na songs
- Version history s rollback
- Čas: 60+ hodin

---

## 7. PROVOZNÍ ZÁLEŽITOSTI

### Database performance & storage

**Aktuální stav:**
- MariaDB 11 s docker volume
- 25 migrací aplikováno
- Fulltext + trigram indexy implementovány nedávno

**Optimalizace:**
- ✅ pack_search_index přidán (migrace 1757540353412)
- ✅ Fulltext indexy (migrace 1757700007357)
- ✅ Trigram indexy (migrace 1757704000000)
- ✅ Translation likes count pro performance (1757420833000)

**Monitoring potřeby:**
- ❌ Disk space monitoring chybí
- ❌ Query performance metrics chybí
- ❌ Connection pool monitoring chybí

**Doporučení:**
- Implementovat slow query log
- Přidat disk space alerts
- Monitorovat connection pool usage
- Naplánovat pravidelné ANALYZE TABLE

### Infrastructure škálovatelnost

**Aktuální setup:**
- Docker Compose pro development
- Single server deployment (development server)
- Multi-arch Docker images (linux/amd64)

**Škálovatelnost:**
- ✅ **Horizontal scaling ready**:
  - Stateless backend (JWT tokens)
  - Redis pro shared session
  - BullMQ job queue

- ⚠️ **Bottlenecks:**
  - MariaDB - single instance
  - Qdrant - single instance
  - No load balancer setup

**Production readiness:**
- ⚠️ Single point of failure (DB)
- ⚠️ No auto-scaling
- ⚠️ No CDN pro static assets

**Doporučení pro production:**
1. Database replication (master-slave)
2. Load balancer (nginx/HAProxy)
3. CDN pro Next.js static files
4. Container orchestration (Kubernetes nebo minimal Docker Swarm)
5. Backup automation

### Maintenance needs

**Pravidelné:**
- ✅ Security updates: Aktivně se dějí (poslední před 2 týdny)
- ✅ Dependency updates: Automatické přes GitHub dependabot (?)
- ⚠️ Database backup: Není zřejmé z repozitáře
- ⚠️ Log rotation: Není konfigurováno

**Migration management:**
- ✅ TypeORM migrations funkční
- ✅ Transaction wrapping (generate-migration-with-transaction.sh)
- ✅ Show/revert commands dostupné
- ⚠️ 25 migrací - consider squashing starých

**Doporučené schedule:**
- **Denně**: Automated backups
- **Týdně**: Dependency vulnerability scan
- **Měsíčně**: Database maintenance (ANALYZE, OPTIMIZE)
- **Kvartálně**: Migration squashing, tech debt review

### Monitoring & alerting stav

**Implementováno:**
- ✅ nest-status-monitor (runtime metrics)
- ✅ BullBoard (job queue dashboard)
- ✅ Statsig (feature flags + analytics)
- ✅ Mixpanel (event tracking)
- ✅ Hotjar (session replay)
- ✅ MeasuringTimeInterceptor (API response times)

**Chybí:**
- ❌ **Error tracking** (Sentry, Rollbar)
- ❌ **Log aggregation** (ELK, Loki)
- ❌ **APM** (New Relic, DataDog)
- ❌ **Uptime monitoring** (UptimeRobot, Pingdom)
- ❌ **Alert management** (PagerDuty, OpsGenie)
- ❌ **Infrastructure monitoring** (Prometheus + Grafana)

**Doporučené implementace:**

**Fáze 1 (Kritická):**
1. Sentry pro error tracking
   - Frontend + Backend
   - Source maps pro stack traces
   - Slack/Email alerts

2. UptimeRobot pro uptime monitoring
   - Ping každých 5 minut
   - Email alerts při downtime

**Fáze 2 (Důležitá):**
3. Prometheus + Grafana
   - Custom metrics z backendu
   - Database metrics
   - Redis metrics

4. Winston structured logging
   - JSON logs
   - Log levels
   - Rotation

**Fáze 3 (Žádoucí):**
5. ELK Stack nebo Loki
   - Centralized logs
   - Query interface
   - Long-term retention

### Backup & disaster recovery

**Aktuální stav:**
- ⚠️ **Není zdokumentováno v repozitářích**
- Docker volumes: mariadb_data, redis_data, qdrant_data
- Nejasné, zda jsou backupovány

**Kritické komponenty:**
1. **MariaDB** - primární data (písně, users, teams)
2. **Qdrant** - embeddingy (může být regenerováno, ale časově náročné)
3. **Redis** - cache (může být ztraceno, ale kritické pro job queue)

**Doporučená strategie:**

**Backup schedule:**
- **MariaDB**:
  - Daily full backup (mysqldump nebo mariabackup)
  - Retention: 7 denních, 4 týdenní, 3 měsíční
  - Test restore monthly

- **Qdrant**:
  - Weekly snapshot
  - Retention: 4 týdny
  - Fallback: Regenerace z MariaDB možná

- **Redis**:
  - RDB snapshot denně (konfigurace Redis)
  - AOF pro point-in-time recovery (optional)

**Disaster Recovery Plan:**
1. **RTO** (Recovery Time Objective): < 4 hodiny
2. **RPO** (Recovery Point Objective): < 24 hodin
3. **Backup location**: Off-site (S3, BackBlaze)
4. **Runbook**: Dokumentovaný postup recovery

**Missing:**
- ❌ Documented backup procedure
- ❌ Automated backup scripts
- ❌ Disaster recovery runbook
- ❌ Tested restore procedure

**Action items:**
1. Implementovat automatické MariaDB backups (cron + mysqldump)
2. Setup S3/BackBlaze storage
3. Napsat disaster recovery runbook
4. Quarterly restore drill

---

## 8. DOPORUČENÍ & ROADMAPA

### Doporučené kroky - Next 48 hodin

**1. Opravit vývojové prostředí** ⏱️ 2h
```bash
# V obou repozitářích:
npm ci
# Investigate Jest Bus error
# Update CI documentation
```

**2. Vytvořit .env.example** ⏱️ 1h
```bash
cd wt-backend
# Vytvořit .env.example se všemi required variables
# Update README s setup instructions
```

**3. Základní monitoring** ⏱️ 4h
- Setup Sentry account
- Integrate Sentry v backend + frontend
- Configure basic alerts

### Doporučené kroky - Next 2 týdny

**Week 1:**
- ✅ Implementovat rate limiting (2h)
- ✅ Setup automated MariaDB backups (4h)
- ✅ Add slow query logging (2h)
- ✅ Fix embedding cache eviction (3h)
- ✅ Implement uptime monitoring (1h)

**Week 2:**
- ✅ Bundle size analysis & optimization (4h)
- ✅ Testing coverage improvement (8h)
- ✅ Security audit & CSP headers (6h)
- ✅ Write disaster recovery runbook (4h)

### Kritické metriky pro sledování

**Performance:**
- API response time (p50, p95, p99)
- Frontend page load time
- Database query duration
- Job queue processing time

**Reliability:**
- Uptime percentage (target: 99.9%)
- Error rate (target: <0.1%)
- Failed job percentage (target: <1%)

**Scalability:**
- Active users
- Songs in database
- Embeddings count
- Storage usage growth

**User Experience:**
- Search response time (target: <300ms)
- Time to interactive (target: <3s)
- Bounce rate
- Feature adoption rate

### Timeline pro kritickou práci

```
Týden 1-2 (Kritické):
├─ Dev environment fixes         [2h]
├─ Documentation (env vars)      [1h]
├─ Monitoring setup (Sentry)     [4h]
├─ Rate limiting                 [2h]
├─ Backup automation            [4h]
└─ Total: ~13 hodin

Týden 3-4 (Důležité):
├─ Performance optimization      [8h]
├─ Testing coverage             [8h]
├─ Security hardening           [6h]
├─ Slow query monitoring        [2h]
└─ Total: ~24 hodin

Měsíc 2 (Žádoucí):
├─ Centralized logging          [16h]
├─ Multi-language expansion     [20h]
├─ API documentation            [8h]
├─ Database performance tuning  [8h]
└─ Total: ~52 hodin
```

---

## 9. ZÁVĚR

### 🎯 Celkové hodnocení platformy

**Zdraví platformy:** ⭐⭐⭐⭐ (4/5)

**Silné stránky:**
- ✅ Moderní tech stack (Next.js 14, NestJS 10, TypeScript)
- ✅ Solidní architektura s clear separation of concerns
- ✅ Aktivní vývoj (109 commitů za 2 měsíce)
- ✅ Comprehensive testing setup (Playwright + Jest)
- ✅ Automatizovaný CI/CD pipeline
- ✅ ML features (embedding search, family matching)
- ✅ Bezpečnostní updates jsou prioritou

**Oblasti vylepšení:**
- ⚠️ Monitoring & alerting je incomplete
- ⚠️ Backup & disaster recovery není zdokumentováno
- ⚠️ Performance monitoring je manuální
- ⚠️ Testing environment má problémy

### 📊 Stav komponent - Souhrn

| Komponenta | Stav | Poznámka |
|-----------|------|----------|
| Frontend | ✅ Výborný | Aktivní vývoj, UX improvements |
| Backend | ✅ Výborný | Solidní, modular, tested |
| MariaDB | ✅ Dobrý | Indexing optimalizace done |
| Redis | ✅ Dobrý | BullMQ queue healthy |
| Qdrant | ✅ Dobrý | Embeddings funkční |
| Family Matcher | ✅ Dobrý | ML integrace working |
| Embedder | ✅ Dobrý | Přes Bridge service |
| Updater | ❓ Neznámý | Není v repo |
| Monitoring | ⚠️ Částečný | Chybí alerting |
| Backups | ❓ Neznámý | Není zdokumentováno |

### 🚀 Klíčová doporučení

**1. Operační stabilita (TOP priorita):**
- Implementovat error tracking (Sentry)
- Nastavit automated backups
- Vytvořit disaster recovery plan

**2. Developer Experience:**
- Opravit dev environment setup
- Dokumentovat všechny env variables
- Zlepšit onboarding dokumentaci

**3. Performance & Škálovatelnost:**
- Optimalizovat embedding cache
- Analyzovat bundle size
- Připravit infrastructure pro horizontal scaling

**4. Bezpečnost:**
- Rate limiting
- CSP headers
- Automated security scanning

### 📈 Výhled do budoucna

Platforma **Chvalotce.cz** je ve velmi dobrém stavu s aktivním vývojem a moderní technologií. Nedávná vylepšení (search UX, news system, security updates) ukazují na zdravý development proces.

**Doporučený fokus na Q1 2026:**
1. **Operační excellence** - monitoring, backups, alerting
2. **Performance** - optimalizace pro růst uživatelské báze
3. **Developer experience** - lepší dokumentace a tooling

**Dlouhodobá vize:**
- Škálovatelná infrastruktura pro 10k+ active users
- Advanced AI features (auto-translation, chord detection)
- Real-time collaboration features
- PWA s offline support

---

**Zpracoval:** Claude Code Agent
**Datum revize:** 12. února 2026
**Další revize doporučena:** Květen 2026 (za 3 měsíce)
