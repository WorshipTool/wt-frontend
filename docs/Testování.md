Většina základních testů bude provedena pomocí Playwright a jest. Playwright pouzivam pro end to end testovani, jest na mensi testovani funkci

Co chci vsechno testovat?

Zejmena chci testovat základní mechaniky aplikace:
- funkcni a rychle vyhledávání
- LCP performance - velikosti obrázků (viz níže)

## Performance testy - Image Size & LCP

### Jest: Image Size testy (`src/__tests__/performance/image-size.test.ts`)

Statické testy kontrolující velikosti obrázků v `public/assets/`:

- **Raster images (PNG/JPG/GIF):** max 300 KB (100 KB pro ikony v `icons/`)
- **WebP images:** max 100 KB
- **SVG files:** max 100 KB
- **Total budget:** max 10 MB pro všechny obrázky
- **Modern format adoption:** velké raster obrázky (>50 KB) musí mít WebP alternativu

Známé existující porušení jsou uvedeny v `KNOWN_OVERSIZED_FILES` a `KNOWN_MISSING_WEBP` allowlistech přímo v testu. Nové obrázky, které překročí limity, test neprojdou. Při optimalizaci existujících obrázků je třeba odebrat příslušný záznam z allowlistu.

Spuštění: `npm run test:jest`

### Playwright: LCP E2E testy (`tests/e2e/performance/lcp.spec.ts`)

E2E testy měřící reálný LCP a vlastnosti obrázků na stránce:

- **LCP threshold:** max 2500 ms (Web Vitals "good" rating)
- **Image oversize ratio:** max 2.5x (natural vs displayed dimensions)
- **Above-the-fold images:** nesmí používat `loading="lazy"`
- **Transfer size:** žádný obrázek nesmí přesáhnout 300 KB při transferu

Tyto testy běží v rámci `full` E2E suite: `npm run test:e2e:full`

Testy jsou automaticky spousteny pred pushnutim do gitu...
nastaveno pomoci :

`echo "npm run test" > .git/hooks/pre-push`
`chmod +x .git/hooks/pre-push`