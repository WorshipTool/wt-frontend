Většina základních testů bude provedena pomocí Playwright a jest. Playwright pouzivam pro end to end testovani, jest na mensi testovani funkci

Co chci vsechno testovat?

Zejmena chci testovat základní mechaniky aplikace: 
- funkcni a rychle vyhledávání


Testy jsou automaticky spousteny pred pushnutim do gitu...
nastaveno pomoci :

`echo "npm run test" > .git/hooks/pre-push`
`chmod +x .git/hooks/pre-push`