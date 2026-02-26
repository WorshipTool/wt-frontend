# WorshipTool

**WorshipTool** je nástroj pro správu chval, navržený speciálně pro potřeby církevních chválících týmů. Umožňuje snadnou správu písní, variant, statistik a sdílení napříč sbory.

## ✨ Hlavní funkce

- 📝 **Přehledný zpěvník** s podporou více variant textů i akordů
- 🔍 **Fulltextové i chytré vyhledávání pomocí embeddingů**
- 🌍 **Automatické propojování překladů** – různé jazykové verze jedné písně se propojují díky podobnosti textu
- 📊 **Statistiky hraní písní** – víte, které písně hrajete nejčastěji
- 👥 **Podpora více sborů** – každá církev si spravuje svůj vlastní zpěvník
- 📅 **Plánování setů** – přehledné plánování nedělních setkání a chval
- 🔒 **Přístupová práva** – oddělení rolí (admin, editor, hráč)
- 🤝 **Real-time spolupráce** – živé úpravy a sdílení via WebSocket
- 📄 **Export do PDF** – tisk písní a setů

## 🧑‍💻 Technologie

Projekt je postaven na moderním JavaScript/TypeScript stacku:

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router) + [Material UI v5](https://mui.com/)
- **Backend**: [NestJS](https://nestjs.com/)
- **Databáze**: PostgreSQL + [TypeORM](https://typeorm.io/)
- **Real-time**: Socket.io
- **AI / ML**:
  - Embeddingy písní pomocí jazykových modelů pro:
    - inteligentní vyhledávání
    - automatické spojování překladů stejné písně
- **Analytika**: Statsig (feature flags), Mixpanel, Hotjar
- **Platby**: Stripe
- **Deploy**: Vercel / Railway / Docker-ready

## 🚀 Lokální spuštění

### Požadavky

- Node.js 18+
- npm

### Nastavení

1. Naklonuj repozitář a nainstaluj závislosti:

```bash
npm install
```

2. Nastav prostředí – zkopíruj a uprav `.env`:

```bash
cp .env.example .env
```

3. Přidej záznam do `/etc/hosts` (aplikace běží na vlastní doméně):

```
127.0.0.1  test-chvalotce.cz
```

4. Spusť vývojový server:

```bash
npm run dev
# → http://test-chvalotce.cz:5500
```

## 🛠️ Dostupné příkazy

| Příkaz | Popis |
|--------|-------|
| `npm run dev` | Vývojový server (port 5500) |
| `npm run build` | Produkční build |
| `npm run start` | Spuštění produkčního buildu |
| `npm run lint` | ESLint kontrola |
| `npm run check-types` | TypeScript typová kontrola |
| `npm run test:jest` | Unit testy (Jest) |
| `npm run test:e2e:smoke` | E2E smoke testy (Playwright) |
| `npm run test:e2e:critical` | E2E kritické testy |
| `npm run test:e2e:full` | Kompletní E2E sada |
| `npm run generate-api` | Regenerace API klientů z OpenAPI |

## 🧪 Testování

Projekt využívá dvě testovací vrstvy:

- **Jest** – unit a integrační testy, spouštěj před každým commitem
- **Playwright** – E2E testy rozdělené do tří sad (smoke → critical → full)

Viz [`TESTME.md`](./TESTME.md) pro kompletní manuální testovací checklist.

## 📁 Struktura projektu

```
src/
├── app/          # Next.js App Router (stránky, layouty, API routes)
├── common/       # Sdílené komponenty, UI knihovna, providery
├── api/          # API vrstva (generované klienty, DTO, mapování)
├── hooks/        # Feature-specific React hooks
├── tech/         # Technické utility (auth, oprávnění, URL, ...)
├── routes/       # Route helpers a subdoména handling
└── types/        # TypeScript typy a rozhraní
```

## 📖 Dokumentace

Projektová dokumentace (v češtině) je v adresáři [`docs/`](./docs/):

- Vyhledávání, zveřejňování písní, mergování, testování a další.

Pro AI agenty je k dispozici [`CLAUDE.md`](./CLAUDE.md) s vývojářským průvodcem.
