# Zvědátoři – neoficiální upozorňovač primárně pro Mastodon
Klíčové informace na úvod:
1. YT kanál: [Zvědátoři - YouTube](https://www.youtube.com/@Zvedatori/featured)
1. Mastodon účet: [Zvědátoři (neoficiální) (@Zvedatori@mastodonczech.cz) - MastodonCzech](https://mastodonczech.cz/@Zvedatori)

## Struktura projektu
Repozitář se skládá ze tří utilitek pro příkazovou řádku a dvou konfiguračních
souborů pro jejich automatizované spouštění.

1. [`crawler.js`](./crawler.js) – pomocí [YouTube Data API](https://developers.google.com/youtube/v3)
	přidá nová videa do souboru [`data.json`](./data.json)
1. [`index.js`](./index.js) – ze souboru [`data.json`](./data.json) vybere požadovaný příspěvek
	a vypíše jej v užicatelsky přívětivém formátu. S argumentem
	`mastodon` konkrétně vybere dnešní a náhodně jeden starší
	a pošlejej na Mastodontí účet
1. [`notifications.js`](./notifications.js) – vyextrahuje ze stránky [Komunita](https://www.youtube.com/@Zvedatori/community)
	zapsané notifikace. Pokud voláno s argumentem `mastodon` (a `--old`),
	příspěvky mladší než zadaný limit přepošle na Mastodontí účet
1. [`.github/workflows/scheduled-every-morning.yml`](./.github/workflows/scheduled-every-morning.yml) – konfigurační soubor
	pro [GitHub Action](https://docs.github.com/en/actions), který spustí `crawler` a `index`
	utility cronem v ~8:00 hodin CET/CEST.
1. [`.github/workflows/scheduled-every-afternoon.yml`](./.github/workflows/scheduled-every-afternoon.yml) – konfigurační soubor
	pro [GitHub Action](https://docs.github.com/en/actions), který spustí `notifications`
	utilitu cronem v ~17:53 hodin CET/CEST. A pátek navíc znovu zavolá `crawler` a `index` s parametrem pro
	publikování jen pokud páteční stream.
1. *[`podcast.js`](./podcast.js) – script páruje audio verze s již zaznamenanými videi, dále je*
	*ke zvážení jak/zda tuto informaci zobrazovat (limit 500znaků + různě dlouhé zdroje)*

## TODO
- [ ] [podcasty/audio verze](https://podcasters.spotify.com/pod/show/zvedatori)
	- [x] [`./podcast.js`](./podcast.js)
	- [ ] cron (kdy?)
	- [ ] příspěvky max ~500 znaků (ok?)
- [x] v cronu ošetřit letní/zimní čas https://github.com/orgs/community/discussions/13454
- [x] \(DONE + asi OK neřešit) páteční streamy + ~ošetřit (zkontrolovat ošetření) mimořádných událostí~
- [x] \(zdá se OK) zkontrolovat/ošetřit funkčnost komunity
- [ ] vylepšit strukturu/dokumentaci projektu
