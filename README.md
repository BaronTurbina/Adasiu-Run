# ADASIU RUN — Meat Factory Edition

Grywalny endless runner na GitHub Pages.

## Sterowanie
- Spacja / strzałka ↑ / kliknięcie: skok
- Drugie naciśnięcie w powietrzu: drugi skok
- Drugi raz w powietrzu: podwójny skok
- Esc lub przycisk pauzy: pauza
- Rekord zapisywany lokalnie w przeglądarce

## Publikacja
Wgraj całą zawartość folderu `adasiu-run` do głównego katalogu repozytorium. W GitHub: Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save. GitHub Pages publikuje pliki statyczne, a `index.html` musi leżeć w katalogu głównym źródła publikacji.

## Zawartość
- `index.html` — ekran gry i HUD
- `style.css` — interfejs responsywny
- `game.js` — mechanika, przeszkody, kolizje, podwójny skok
- `assets/` — tło hali, twarz bohatera, sprite'y, kiełbasy i kotlety
