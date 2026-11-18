# Les Bottes — boucherie paysanne (Nantes)

Site vitrine statique, mobile d'abord. Aucun framework : `index.html`, `css/site.css`, `js/site.js`.

## Modifier
- Le HTML se modifie dans `src/index.src.html`, puis `python3 build.py` régénère `index.html`
  (il injecte la carte des départements et le schéma de découpe du bœuf).
- Horaires : `HOURS` dans `js/site.js` **et** le JSON-LD dans `src/index.src.html`.
- Races, morceaux, liste des fêtes : tableaux `BREEDS`, `CUTS`, `FEAST` dans `js/site.js`.

## À faire valider par Les Bottes
- Liste « Le bon des fêtes » (non vérifiée) et fiche « Volailles de Challans ».
- Races et éleveurs actuels (sources : Gault&Millau, Instagram).
- Photos HD originales (celles du site viennent d'Instagram, en basse résolution).
- Nom de domaine, mentions légales.

## Déployer
`npx vercel deploy --prod` depuis ce dossier.
