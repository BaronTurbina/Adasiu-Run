# ADASIU RUN — Meat Factory Edition

Lekka gra typu endless runner działająca w przeglądarce. Nie wymaga instalowania bibliotek ani serwera.

## Sterowanie
- **Spacja**, **↑** lub **W** — skok.
- Kliknięcie/tapnięcie planszy albo przycisku **SKOK** — skok.
- **Esc** lub przycisk **Ⅱ** — pauza.

## Przeszkody
- czerwone skrzynki E2 z mięsem,
- latające kotlety,
- latające kiełbasy.

Gra ma trzy życia, wynik, rekord zapisywany w pamięci przeglądarki oraz stopniowo rosnącą prędkość.

## Publikacja na GitHub Pages
1. Zaloguj się na GitHub i utwórz nowe repozytorium, np. `adasiu-run`.
2. Wgraj **całą zawartość** tego folderu (plik `index.html`, `style.css`, `game.js`, `README.md` oraz folder `assets`). Nie wgrywaj samego ZIP-a.
3. W repozytorium otwórz **Settings → Pages**.
4. W sekcji **Build and deployment** wybierz **Deploy from a branch**.
5. Ustaw branch `main` i folder `/ (root)`, następnie kliknij **Save**.
6. Po chwili gra będzie dostępna pod adresem `https://TWOJ_LOGIN.github.io/adasiu-run/`.

## Uruchomienie lokalne
Otwórz `index.html` w przeglądarce. Do gry nie jest wymagany serwer.

## Personalizacja
Zdjęcie twarzy znajduje się w `assets/adasiu-face.png`. Możesz je podmienić, zachowując tę samą nazwę pliku. Gra rysuje ciało postaci i animuje otwieranie ust podczas skoku.
