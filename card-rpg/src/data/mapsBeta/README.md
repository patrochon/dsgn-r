# 🗺️ Map Beta

Dossier de classement des maps créées avec l'outil de développement (Admin → Cartes de jeu).

## Workflow

1. Crée ta map dans **Admin → 🗺️ Cartes de jeu** (outil de développement seulement).
2. Clique **⬇ Exporter** sur la map : un fichier `.json` est téléchargé.
3. Dépose le fichier `.json` dans ce dossier.
4. Ajoute-le à `index.js` :
   ```js
   import maCarte from './ma-carte.json';
   export const BETA_MAPS = [maCarte];
   ```
5. Les maps Beta ne sont **pas** chargées dans les parties pour l'instant.
   Le moment venu, elles seront intégrées au pool dans `useGameState.js`.

## Format d'une map

```json
{
  "id": "custom_1234567890",
  "name": "Nom de la carte",
  "desc": "Description",
  "playerCount": [2, 3, 4],
  "grid": [[1,1,1], [1,0,1], [1,1,1]],
  "playerStarts": [{ "x": 1, "y": 1, "label": "P1" }]
}
```

Codes de tuiles : `0`=sol, `1`=mur, `3`=item, `4`=objectif, `7`=portail, `8`=magasin, `9`=prison.
