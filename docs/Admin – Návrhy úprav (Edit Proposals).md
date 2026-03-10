# Admin – Návrhy úprav (Edit Proposals)

## Přehled

Funkce **Edit Proposals** umožňuje adminovi navrhovat úpravy UI elementů nebo textu přímo na stránce bez nutnosti okamžitého odeslání. Admin může nashromáždit více návrhů a odeslat je najednou jako jeden implementační úkol.

## Princip fungování

1. **Zachycení**: Admin označí text myší a klikne pravým tlačítkem
2. **Plovoucí tlačítko**: NAD označeným textem se zobrazí kompaktní plovoucí tlačítko „Upravit" — nativní kontextové menu prohlížeče se otevře normálně (neblokujeme ho)
3. **Dialog**: Po kliknutí na plovoucí tlačítko se otevře dialog s náhledem zachyceného textu a textové pole pro popis požadované změny
4. **Sběr**: Po potvrzení se návrh přidá do fronty (ale NENÍ odeslán)
5. **Review panel**: V rohu obrazovky se zobrazí tlačítko s počtem navržených změn
6. **Odeslání**: Admin klikne na tlačítko v rohu, zkontroluje návrhy a vše odešle najednou jako jeden task

### Chování plovoucího tlačítka (Option B)

- Tlačítko se zobrazí **nad** označeným textem, takže nepřekrývá nativní kontextové menu (které se otevírá pod kurzorem)
- Nativní menu funguje normálně — admin může použít Copy, Inspect apod.
- Tlačítko se automaticky zavře po:
  - Kliknutí kamkoli mimo tlačítko (s 600ms grace period)
  - Stisknutí Escape
  - Scrollu nebo změně velikosti okna
  - 10 sekundách bez interakce
- Cooldown 300 ms zabraňuje duplicitnímu zobrazení při rychlém dvojitém pravém kliknutí

## Architektura

### Soubory

```
src/common/components/admin/EditProposals/
├── types.ts                  # TypeScript typy (EditProposal, ElementCapture)
├── useEditProposals.tsx      # Context provider + hook + helper pro formátování zprávy
├── captureUtils.ts           # Utility pro zachycení DOM elementů
├── AdminEditOverlay.tsx      # Globální contextmenu listener — zobrazuje FloatingEditButton
├── FloatingEditButton.tsx    # Plovoucí „Upravit" tlačítko vedle nativního menu
├── AdminContextMenu.tsx      # (Legacy) Vlastní kontextové menu — nahrazeno FloatingEditButton
├── ProposalDialog.tsx        # Dialog pro zapsání návrhu
├── ProposalCornerButton.tsx  # Rohové tlačítko s review panelem
└── index.ts                  # Barrel export
```

### Datové typy

```typescript
// Zachycená informace o DOM elementu/textu
type ElementCapture = {
  type: 'element' | 'text-selection'
  selectedText?: string    // pro text-selection
  elementText?: string     // zkrácený text obsah elementu
  elementTag: string       // např. 'h1', 'p', 'button'
  elementPath: string      // lidsky čitelná cesta, např. 'main / section / h2'
  cssSelector?: string     // CSS selektor pro identifikaci
  pageUrl: string          // URL stránky v době zachycení
  anchorRect?: AnchorRect  // viewport-relative bounding rect pro pozicování
}

// Jeden navržený návrh
type EditProposal = {
  id: string
  capture: ElementCapture
  proposalText: string     // text návrhu od admina
  timestamp: number
}
```

### Context API

Hook `useEditProposals()` poskytuje:
- `proposals` – aktuální fronta návrhů
- `isCollecting` – `true` pokud je aktivní sběr (alespoň 1 návrh nebo čekající dialog)
- `pendingCapture` – zachycení čekající na vyplnění textu v dialogu
- `openProposalFor(capture)` – otevře dialog pro daný element
- `confirmProposal(text)` – přidá návrh do fronty
- `cancelPendingProposal()` – zavře dialog bez přidání
- `removeProposal(id)` – odstraní jeden návrh z fronty
- `clearProposals()` – vymaže všechny návrhy
- `submitAll()` – odešle všechny návrhy jako jeden task
- `isSubmitting` – boolean pro loading stav odesílání

### Odeslání

**Primárně**: Pokud je nastavena `NEXT_PUBLIC_IMPLEMENT_IDEA_URL`, návrhy se odešlou jako implementační task (stejný endpoint jako ImplementIdeaDialog).

**Záloha**: Pokud URL není nastavena, použije se `mailApi.sendFeedbackMail()`.

Formát zprávy obsahuje:
- Počet návrhů
- Ke každému návrhu: URL stránky, element tag/path/selektor, zachycený text, text návrhu

## Integrace

### Providers

`EditProposalsProvider` je přidán do `AppClientProviders.tsx` (uvnitř `SongDragProvider`).

### Globální UI komponenty

Přidány do `layout.tsx`:
- `<AdminEditOverlay />` – globální contextmenu listener + plovoucí tlačítko (viditelný jen adminovi)
- `<ProposalDialog />` – dialog pro zadání návrhu (portal přes Popup)
- `<ProposalCornerButton />` – rohové tlačítko a review panel

## UX

- Event listenery jsou aktivní **pouze pro adminy**
- V editovatelných polích (input, textarea, contenteditable) se kontextové menu NEpřebírá
- Nativní kontextové menu prohlížeče se otevře normálně — přidáváme pouze plovoucí tlačítko vedle něj
- Plovoucí tlačítko se umísťuje NAD označený text, aby nepřekrývalo nativní menu
- Zatímco je dialog otevřen, nové zachycení se neprovede
- Rohové tlačítko se zobrazí teprve po prvním přidaném návrhu (pořadí `order=2`, nad admin panel buttonem)
- Kliknutím na rohové tlačítko se otevře review panel s přehledem všech návrhů
- Panel umožňuje mazat jednotlivé návrhy, zahodit vše nebo odeslat k implementaci

## Testování

Testy jsou v:
- `captureUtils.test.ts` – unit testy pro zachycování DOM elementů
- `useEditProposals.test.tsx` – testy kontextu (přidávání, mazání, odesílání návrhů)
- `FloatingEditButton.test.tsx` – testy plovoucího tlačítka (pozicování, auto-dismiss, interakce)
- `AdminContextMenu.test.tsx` – (Legacy) testy vlastního kontextového menu
