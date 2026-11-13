# ADASIU RUN — Meat Factory Edition

Przeglądarkowa gra typu endless runner w klimacie zakładu przetwórstwa mięsnego. W grze Adasiu przeskakuje czerwone skrzynki E2 i unika latających kotletów oraz kiełbas.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce. Gra nie wymaga instalacji ani serwera.

## Sterowanie

- `Spacja`, `↑` lub `W` — skok.
- Kliknięcie/tapnięcie planszy — skok.
- Przycisk `SKOK` na telefonie — skok.
- `Esc` lub przycisk pauzy — pauza.

## Publikacja na GitHub Pages

1. Rozpakuj archiwum ZIP.
2. Wejdź do repozytorium GitHub `Adasiu-Run`.
3. W zakładce **Code** wybierz **Add file → Upload files** (jeśli repo jest puste, kliknij link **uploading an existing file**).
4. Wgraj zawartość folderu `adasiu-run` — plik `index.html`, `game.js`, `style.css` i folder `assets`.
5. Zatwierdź przez **Commit changes**.
6. Wejdź w **Settings → Pages**.
7. Ustaw **Deploy from a branch**, branch `main`, folder `/ (root)`, kliknij **Save**.
8. Po publikacji strona będzie dostępna pod adresem `https://baronturbina.github.io/Adasiu-Run/`.

## Grafiki

- `assets/factory-background.jpg` — fotograficzne tło hali produkcyjnej.
- `assets/adasiu-face.png` — portret używany jako twarz bohatera.
- `assets/sausage.png` i `assets/cutlet.png` — grafiki latających przeszkód.

Rekord jest zapisywany lokalnie w przeglądarce (`localStorage`).
