# Zvědátoři – neoficiální upozorňovač primárně pro Mastodon
Klíčové informace na úvod:
1. YT kanál: [Zvědátoři - YouTube](https://www.youtube.com/@Zvedatori/featured)
1. Mastodon účet: [Zvědátoři (neoficiální) (@Zvedatori@mastodonczech.cz) - MastodonCzech](https://mastodonczech.cz/@Zvedatori)

## Struktura projektu
Repozitář se skládá ze tří utilitek pro příkazovou řádku a zatím jednoho konfiguračního
souboru pro jejich automatizované spouštění.

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
	pro [GitHub Action](https://docs.github.com/en/actions), který spustí předchozí
	utility cronem v 6 hodin GMT.

## TODO
- [ ] [podcasty/audio verze](https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbWZ0dThrdHd1RGFoZlpnVUluSW5PbVlCaF9fZ3xBQ3Jtc0tsdTF5eFhJTXZpNjdhMUJ4d0M0SzI2dU9FQjdTcW16eUV0MzRWaS1ETG83NmgwQjJIQ09JcHlPRWd2RXhYRmhnU2JXVm4xd2F5RjN1Q0NnME9DbWRlTEVyRTZ4ZzNlNFBLUXFzd1FBbHJyT21XU0FFMA&q=https%3A%2F%2Fanchor.fm%2Fzvedatori&v=6YqlMOh4_iQ)
- [ ] páteční streamy + ošetřit (zkontrolovat ošetření) mimořádných událostí
- [ ] zkontrolovat/ošetřit funkčnost komunity
- [ ] vylepšit strukturu/dokumentaci projektu
