# 🗺️ DÉTOPIA — Du prototype JavaScript au jeu de société commercialisé

> **Feuille de route conçue pour avancer par petits moments.**
> Chaque tâche a : un temps estimé ⏱️, les outils nécessaires 🛠️, et un niveau d'énergie requis 🔋.
> Tu n'as JAMAIS besoin de réfléchir à « quoi faire ensuite » — le document le fait pour toi.

---

## 📌 RÈGLES D'UTILISATION (lis ceci à chaque session, 30 secondes)

1. **Une seule tâche à la fois.** Mets `🟡` devant la tâche en cours. Pas deux.
2. **Choisis selon ton énergie du moment :**
   - 🔋 = faible énergie (tâche mécanique, peut se faire fatigué)
   - 🔋🔋 = énergie moyenne (demande de l'attention)
   - 🔋🔋🔋 = haute concentration (garde pour tes bons moments)
3. **Chaque tâche a un "✅ Fini quand"** — si tu ne peux pas dire si c'est fini, c'est que ce n'est pas fini.
4. **Respecte les portes 🚪.** Ne commence pas une phase si la porte n'est pas franchie. Ça t'évite de t'éparpiller.
5. **15 minutes seulement ?** Va directement à la section « ⚡ J'ai juste 15 minutes » de ta phase courante.
6. **Tu décroches pendant 3 semaines ? Pas grave.** Reviens ici, regarde le tableau de bord, reprends la tâche 🟡.

---

## 🎛️ TABLEAU DE BORD

| Phase | Statut | Porte franchie ? |
|---|---|---|
| 1. Stabiliser le prototype numérique | 🟢 EN COURS | — |
| 2. Playtests numériques | ⬜ Verrouillée | 🚪 Phase 1 complète |
| 3. Prototype papier | ⬜ Verrouillée | 🚪 10 parties jouées |
| 4. Playtests externes | ⬜ Verrouillée | 🚪 Prototype papier jouable |
| 5. Édition (2 branches au choix) | ⬜ Verrouillée | 🚪 Règles stables depuis 5 parties |
| 6. Protection légale | ⬜ Parallèle | 🚪 Démarre dès la phase 3 |

---

# PHASE 1 — Stabiliser le prototype numérique

**Pourquoi :** le jeu JavaScript est ton banc d'essai. Il doit être assez solide pour jouer des vraies parties et équilibrer le jeu, AVANT d'imprimer quoi que ce soit.

**🚪 Porte de sortie :** une partie complète à 4 joueurs, du début à la victoire, sans bug ni question sans réponse + les règles écrites au complet.

### Tâches

- [x] **1.1 — Sauvegarde de partie automatique** → ❌ **DÉCISION : pas de sauvegarde** *(2026-06-10)*
  Choix de design assumé : quitter ou rafraîchir la page réinitialise la partie en cours.
  ✅ Tâche fermée — rien à faire.

- [x] **1.2 — Validation des maps custom**
  → ✅ **DÉCISION + FAIT** *(2026-06-10)* : l'outil de création de maps est réservé au développement.
  Les maps créées ne sont plus chargées dans les parties. Un bouton **⬇ Exporter** télécharge la map en JSON,
  à classer dans le dossier `src/data/mapsBeta/` (« Map Beta ») du projet. Elles seront intégrées au pool le moment venu.
  📌 Reporté à l'intégration : valider chaque map Beta (grille, murs, bases) AVANT de l'ajouter au pool de jeu.

- [ ] **1.3 — Corriger le bug Wiki (swap permanent)**
  ⏱️ 30 min · 🛠️ Claude Code · 🔋
  Le swap Force↔Magie de la classe Wiki ne se remet jamais à la normale.
  ✅ Fini quand : après le tour du Wiki, ses stats sont revenues à la normale.

- [ ] **1.4 — Corriger le bug Chapeaux (portail)**
  ⏱️ 30 min · 🛠️ Claude Code · 🔋
  Avec un seul autre portail disponible, le Chapeaux subit une sortie aléatoire au lieu de choisir.
  ✅ Fini quand : un Chapeaux choisit toujours sa sortie, peu importe le nombre de portails.

- [ ] **1.5 — Corriger le bug Champagne (or doublé)**
  ⏱️ 30 min · 🛠️ Claude Code · 🔋
  La carte dit « 3 tours » mais ne s'applique qu'une fois.
  ✅ Fini quand : l'or est doublé 3 tours de suite.

- [ ] **1.6 — Décision design : la case Objectif ⭐**
  ⏱️ 30 min · 🛠️ Papier + crayon (PAS d'ordi) · 🔋🔋
  La case existe sur les maps mais ne fait rien. Décide : victoire alternative ? Trésor majeur ? Événement ? La supprimer ?
  ✅ Fini quand : tu as écrit ta décision en 2 phrases. (L'implémentation = tâche 1.7.)

- [ ] **1.7 — Implémenter la décision de 1.6**
  ⏱️ 60 min · 🛠️ Claude Code · 🔋🔋
  ✅ Fini quand : la case Objectif fait ce que tu as décidé, testé en partie.

- [ ] **1.8 — Vérification de la portée des armes**
  ⏱️ 60 min · 🛠️ Claude Code · 🔋🔋
  Les portées (r2, r4, r6…) sont sur les cartes mais ignorées au combat.
  ✅ Fini quand : un arc r4 ne peut pas attaquer à 6 cases.

- [ ] **1.9 — Effets d'armes manquants (lot 1 : armes de mêlée)**
  ⏱️ 60 min · 🛠️ Claude Code · 🔋🔋
  Hache de main (détruite après lancer), Lance (repousse), Épée longue (pas de déplacement après), Hache de guerre (perce 2 armure).
  ✅ Fini quand : les 4 effets fonctionnent en partie test.

- [ ] **1.10 — Effets d'armes manquants (lot 2 : distance et magie)**
  ⏱️ 60 min · 🛠️ Claude Code · 🔋🔋
  Arc court (distance min 3), Épée de sang (relance sur 6), Arc des Nécromanciens, Sceptre d'enchantement (vol de carte).
  ✅ Fini quand : les 4 effets fonctionnent en partie test.

- [ ] **1.11 — Effets de sorts et objets manquants (lot 3)**
  ⏱️ 90 min · 🛠️ Claude Code · 🔋🔋🔋
  Confusion, Nova de Givre, Résurrection, Cape d'Invisibilité, Vision prophétique, et le reste de la liste des ~28 effets non codés.
  ✅ Fini quand : chaque carte du deck fait ce que sa description dit. (Peut se découper en sous-lots de 30 min.)

- [ ] **1.12 — Écrire les règles : le tour de jeu**
  ⏱️ 45 min · 🛠️ Google Docs · 🔋🔋
  Pioche, or, 3 actions, déplacement au dé, fin de tour, défausse à 6 cartes.
  ✅ Fini quand : quelqu'un qui n'a jamais joué peut jouer un tour en lisant seulement ça.

- [ ] **1.13 — Écrire les règles : le combat**
  ⏱️ 45 min · 🛠️ Google Docs · 🔋🔋
  Initiative, armes, armure, monstres (3 piles), mort et respawn (destin), élimination.
  ✅ Fini quand : un combat complet peut se résoudre en lisant seulement ça.

- [ ] **1.14 — Écrire les règles : les cases spéciales**
  ⏱️ 45 min · 🛠️ Google Docs · 🔋🔋
  Magasins, portails, prisons, pièges, coffres, bases, objectif.
  ✅ Fini quand : chaque type de case a son paragraphe.

- [ ] **1.15 — Modal « Règles » dans le jeu**
  ⏱️ 45 min · 🛠️ Claude Code · 🔋
  Demander : « Ajoute un bouton 📖 Règles au menu et en partie, qui affiche le contenu des règles. » (Colle tes textes de 1.12–1.14.)
  ✅ Fini quand : le bouton existe et affiche les règles.

### ⚡ J'ai juste 15 minutes (Phase 1)
- Joue 2-3 tours et note UN truc qui cloche dans un fichier `NOTES.md`.
- Relis une carte du deck et vérifie si son effet marche vraiment en jeu.
- Écris le paragraphe de règles d'UNE seule case spéciale.
- Demande à Claude Code de corriger UN des petits bugs (1.3, 1.4 ou 1.5).

---

# PHASE 2 — Playtests numériques

**🚪 Porte d'entrée :** Phase 1 complète.
**🚪 Porte de sortie :** 10 parties complètes jouées + fiche de feedback remplie pour chacune.

**Pourquoi :** c'est ici que tu découvres si le jeu est FUN et ÉQUILIBRÉ. L'admin panel (poids des cartes, maps custom) est ton laboratoire — chaque ajustement se teste sans rien réimprimer.

### Tâches

- [ ] **2.1 — Créer la fiche de playtest**
  ⏱️ 30 min · 🛠️ Google Forms (ou papier) · 🔋
  Questions : Durée de la partie ? Quelle race/classe a gagné ? Y a-t-il eu un moment plate ? Une carte trop forte/inutile ? Une règle pas claire ? Note de fun /10.
  ✅ Fini quand : le formulaire existe et tu peux le remplir en 3 minutes.

- [ ] **2.2 à 2.6 — Jouer 10 parties** *(une case par bloc de 2 parties)*
  ⏱️ 45-90 min par partie · 🛠️ Le jeu + la fiche · 🔋🔋
  - [ ] Parties 1-2 : à 2 joueurs (joue les deux mains toi-même, c'est correct !)
  - [ ] Parties 3-4 : à 3-4 joueurs
  - [ ] Parties 5-6 : à 4 joueurs avec d'autres humains
  - [ ] Parties 7-8 : races/classes jamais testées
  - [ ] Parties 9-10 : à 5-6 joueurs
  ✅ Fini quand : 10 fiches remplies.

- [ ] **2.7 — Bilan d'équilibrage**
  ⏱️ 60 min · 🛠️ Les 10 fiches + papier · 🔋🔋🔋
  Quelles races/classes gagnent trop ? Quelles cartes ne sont jamais jouées ? La durée de partie est-elle bonne (cible : 60-90 min) ?
  ✅ Fini quand : tu as une liste de max 10 ajustements à faire.

- [ ] **2.8 — Appliquer les ajustements via l'admin panel**
  ⏱️ 30-60 min · 🛠️ Onglets Cartes et Rareté de l'admin · 🔋
  ✅ Fini quand : la liste de 2.7 est traitée. (Rejoue 2 parties pour valider si les changements sont gros.)

### ⚡ J'ai juste 15 minutes (Phase 2)
- Joue un début de partie (3 tours) avec une race jamais testée.
- Relis 2 fiches de playtest et surligne les patterns qui reviennent.
- Ajuste le poids de 3 cartes dans l'admin.

---

# PHASE 3 — Prototype papier

**🚪 Porte d'entrée :** 10 parties numériques + bilan d'équilibrage fait.
**🚪 Porte de sortie :** une boîte prototype complète, jouable sans écran, avec règles imprimées.

**Pourquoi :** un jeu de société se vend en physique. Et certaines mécaniques numériques ne survivent PAS au papier — il faut le découvrir maintenant, pas après avoir payé un illustrateur.

### Tâches

- [ ] **3.1 — Audit de « physicalisation »** ⚠️ TÂCHE LA PLUS IMPORTANTE DE LA PHASE
  ⏱️ 90 min · 🛠️ Papier + les règles écrites · 🔋🔋🔋
  Pour CHAQUE mécanique, écris comment elle se traduit en physique :
  - Brouillard de guerre → tuiles face cachée qu'on retourne ? Trop manipulatoire ?
  - PV et stats trackés automatiquement → cadrans ? jetons ? feuille de perso effaçable ?
  - Deck pondéré (poids des cartes) → combien d'exemplaires de chaque carte imprimer ?
  - 3 piles de monstres avec remplacement → 3 paquets de cartes monstre ?
  - Jets de dé automatiques → un d6 normal suffit ?
  - Or → jetons de poker ? pièces en carton ?
  ✅ Fini quand : chaque mécanique a sa solution physique OU est marquée « à couper ».

- [ ] **3.2 — Nombre d'exemplaires par carte**
  ⏱️ 45 min · 🛠️ L'onglet Rareté de l'admin (les poids = ta réponse !) · 🔋🔋
  Convertis les poids en exemplaires : poids 4 = 4 copies, poids 1 = 1 copie, etc. Vise un deck physique de 100-140 cartes.
  ✅ Fini quand : tu as un tableau carte → quantité.

- [ ] **3.3 — Imprimer les cartes v1**
  ⏱️ 2-3 h (découpage inclus, parfait devant la TV) · 🛠️ La page `cartes.html` du projet (déjà imprimable !), imprimante, papier, ciseaux, protège-cartes (sleeves) + vieilles cartes communes comme support · 🔋
  ✅ Fini quand : le deck complet est sleevé et mélangeable.

- [ ] **3.4 — Fabriquer le plateau**
  ⏱️ 90 min · 🛠️ Une capture d'écran de map du jeu, impression A3 (Bureau en Gros) OU tuiles cartonnées si tu gardes le brouillard de guerre · 🔋
  ✅ Fini quand : le plateau est sur la table et les pions tiennent sur les cases.

- [ ] **3.5 — Rassembler le matériel**
  ⏱️ 60 min · 🛠️ Pige dans d'autres jeux : pions/meeples, d6, jetons d'or, cubes pour les PV · 🔋
  ✅ Fini quand : tout le matériel de l'audit 3.1 est dans une boîte (à chaussures, c'est parfait).

- [ ] **3.6 — Première partie physique en solo**
  ⏱️ 90 min · 🛠️ La boîte + les règles imprimées · 🔋🔋🔋
  Joue 2 personnages toi-même. Note CHAQUE friction : « j'ai oublié de compter X », « trop de jetons à manipuler », etc.
  ✅ Fini quand : partie complétée + liste de frictions écrite.

- [ ] **3.7 — Itération matérielle**
  ⏱️ 60 min · 🛠️ Selon la liste de 3.6 · 🔋🔋
  Règle les 3 plus grosses frictions (souvent : trop de tracking manuel → simplifier les stats).
  ✅ Fini quand : les 3 pires frictions ont une solution.

- [ ] **3.8 — Règles v2 (version physique)**
  ⏱️ 90 min · 🛠️ Google Docs · 🔋🔋🔋
  Adapte les règles : mise en place, qui commence, manipulation des monstres, etc.
  ✅ Fini quand : les règles décrivent le jeu PHYSIQUE de la mise en place à la victoire.

### ⚡ J'ai juste 15 minutes (Phase 3)
- Découpe et sleeve 20 cartes.
- Trie les jetons/pions dans des sacs ziploc.
- Relis une section des règles v2 à voix haute (les trous s'entendent).

---

# PHASE 4 — Playtests externes

**🚪 Porte d'entrée :** prototype papier jouable.
**🚪 Porte de sortie :** 5 parties jouées par des gens SANS que tu expliques les règles à l'oral.

**Pourquoi :** un éditeur ou un backer Kickstarter jugera le jeu sans toi dans la pièce. Le jeu doit s'expliquer tout seul.

### Tâches

- [ ] **4.1 — Playtests amis/famille (3 parties)**
  ⏱️ 2 h par soirée · 🛠️ Le prototype + fiches de feedback · 🔋🔋
  Tu peux expliquer les règles, mais NOTE chaque question posée — chacune est un trou dans les règles.
  ✅ Fini quand : 3 parties + listes de questions.

- [ ] **4.2 — Le test des règles muettes** ⚠️ LE TEST QUI COMPTE
  ⏱️ 2 h · 🛠️ Le prototype, des joueurs, et toi avec du tape sur la bouche (au figuré) · 🔋🔋
  Donne la boîte. Ne dis RIEN. Regarde-les se débrouiller avec les règles écrites. Prends des notes en silence.
  ✅ Fini quand : ils ont fini une partie (ou abandonné — et tu sais exactement où).

- [ ] **4.3 — Trouver des playtesters externes**
  ⏱️ 3 × 20 min (recherches) · 🛠️ Google, Facebook, Discord · 🔋
  Cherche : groupes Meetup jeux de société de ta région, événements protospiel, Discord « Game Designers of North America » ou « Board Game Design Lab », cafés ludiques (à Montréal : Randolph, Col & Gris…).
  ✅ Fini quand : tu as 3 contacts/événements concrets avec dates.

- [ ] **4.4 — 2 parties avec des inconnus**
  ⏱️ une soirée chacune · 🛠️ Prototype + humilité · 🔋🔋🔋
  Les inconnus n'ont pas peur de te faire de la peine. C'est le feedback le plus précieux.
  ✅ Fini quand : 2 parties + fiches remplies.

- [ ] **4.5 — Itération finale des règles**
  ⏱️ 2-3 × 60 min · 🛠️ Tout le feedback accumulé · 🔋🔋🔋
  ✅ Fini quand : 5 parties de suite SANS modifier une seule règle. → 🚪 Porte de la phase 5 franchie !

### ⚡ J'ai juste 15 minutes (Phase 4)
- Envoie UN message à un groupe de playtest.
- Relis les notes du dernier playtest et choisis UN changement.
- Mets à jour une carte du prototype à la main (sharpie sur sleeve, c'est légitime).

---

# PHASE 5 — Édition : choisis ta branche

**🚪 Porte d'entrée :** règles stables depuis 5 parties.

> **DÉCISION (⏱️ prends une semaine pour y penser, pas plus) :**
> - **Branche A — Pitcher à un éditeur** : zéro investissement, l'éditeur paye l'art et la fabrication. Tu touches 6-10 % de royautés. Tu perds le contrôle créatif. *Recommandé pour un premier jeu.*
> - **Branche B — Auto-édition (Kickstarter/Gamefound)** : contrôle total, marges plus grosses, MAIS investissement de 10 000-40 000 $ et un deuxième emploi en logistique/marketing.
> ✅ Décision prise quand : tu as écrit laquelle et pourquoi en 3 phrases.

## Branche A — Pitcher à un éditeur

- [ ] **A.1 — Sell sheet (1 page)**
  ⏱️ 2 × 60 min · 🛠️ Canva · 🔋🔋
  Nom, 2-6 joueurs, 60-90 min, 12+, pitch en 2 phrases, 3 mécaniques clés, photo du prototype.
  ✅ Fini quand : tout tient sur UNE page et donne envie.

- [ ] **A.2 — Vidéo de présentation (3 min max)**
  ⏱️ 2 h · 🛠️ Téléphone + trépied improvisé · 🔋🔋🔋
  30 s de pitch, 2 min de « comment on joue », 30 s sur ce qui rend Détopia unique. Pas besoin de montage fancy.
  ✅ Fini quand : la vidéo est sur YouTube en non-répertorié.

- [ ] **A.3 — Liste de 10 éditeurs cibles**
  ⏱️ 3 × 30 min · 🛠️ BoardGameGeek + sites des éditeurs · 🔋
  Éditeurs qui publient des jeux SIMILAIRES (affrontement, cartes, 60-90 min). Au Québec/francophonie : Scorpion Masqué, Synapses Games, Randolph, Origames, Matagot… Note leur processus de soumission (la plupart ont une page « submissions »).
  ✅ Fini quand : tableau de 10 éditeurs avec contact + processus.

- [ ] **A.4 — Envoyer 10 soumissions**
  ⏱️ 10 × 20 min (une par session !) · 🛠️ Email + sell sheet + lien vidéo · 🔋
  ✅ Fini quand : 10 envoyées. Attends-toi à 6 silences, 3 refus, 1 « intéressé ». C'est NORMAL.

- [ ] **A.5 — Salons et festivals**
  ⏱️ 1 journée par événement · 🛠️ Prototype + sell sheets imprimées · 🔋🔋🔋
  Les éditeurs prennent des rendez-vous de pitch en salon. Vise : Salon du jeu de Montréal, Granby (Festival du jeu), et le Graal : FIJ Cannes ou Essen.
  ✅ Fini quand : tu as pitché en personne à au moins 3 éditeurs.

## Branche B — Auto-édition

- [ ] **B.1 — Budget prévisionnel** — ⏱️ 2 h · 🛠️ Tableur · 🔋🔋🔋 — Illustration (3 000-15 000 $), graphisme, fabrication (vise 1 000-2 000 boîtes), fret, taxes, pub, marge Kickstarter (~10 %).
- [ ] **B.2 — Engager un illustrateur** — ⏱️ recherches 3 × 30 min + contrat · 🛠️ ArtStation, Instagram, contrat écrit · 🔋🔋
- [ ] **B.3 — Demander 3 soumissions de fabricants** — ⏱️ 3 × 30 min · 🛠️ LongPack, Panda GM, WhatzGames · 🔋
- [ ] **B.4 — Prototype « beau » (print pro)** — ⏱️ 1-2 sem. de délai · 🛠️ TheGameCrafter ou MakePlayingCards · 🔋
- [ ] **B.5 — Page Kickstarter + 3 mois de marketing AVANT le lancement** — ⏱️ c'est un emploi à temps partiel · 🔋🔋🔋 — Règle d'or : on ne lance pas sans 1 000 abonnés à la page de prélancement.

---

# PHASE 6 — Protection et légal (en parallèle, dès la phase 3)

- [ ] **6.1 — Vérifier le nom « Détopia »**
  ⏱️ 30 min · 🛠️ Google, BoardGameGeek, base de données des marques (OPIC au Canada), registres de domaines · 🔋
  ✅ Fini quand : tu sais si le nom est libre. Sinon : brainstorm de noms = excellente tâche de 15 min.

- [ ] **6.2 — Réserver les bases**
  ⏱️ 30 min · 🛠️ Registraire de domaine, Instagram, page BGG · 🔋
  Domaine .com/.ca, compte Instagram, et (plus tard) une fiche BoardGameGeek.
  ✅ Fini quand : domaine + handle réservés.

- [ ] **6.3 — Traces de paternité**
  ⏱️ 15 min · 🛠️ Ton repo Git fait déjà le travail ! · 🔋
  L'historique Git du projet documente des années de design — c'est une preuve de paternité datée. Garde aussi un PDF daté des règles à chaque version majeure.
  ✅ Fini quand : un PDF des règles v2 est archivé (email à toi-même = suffisant).

- [ ] **6.4 — Si branche B : structure d'entreprise**
  ⏱️ 2 h + frais · 🛠️ Registraire des entreprises du Québec · 🔋🔋🔋
  Enregistrement d'entreprise, compte bancaire séparé, taxes (TPS/TVQ si > 30 000 $).
  ✅ Fini quand : tu peux encaisser légalement l'argent d'un Kickstarter.

---

## 🧠 RAPPELS ANTI-TDAH (à relire quand tu te sens coupable de ne pas avancer)

- **Le jeu numérique existe déjà et il est jouable.** Tu n'es pas au début — tu es au tiers du chemin.
- Une tâche de 30 min faite > une tâche de 3 h planifiée.
- Si une tâche te bloque depuis 2 semaines, elle est mal découpée : demande à Claude Code de la découper en sous-tâches de 20 min.
- Les phases 1-2 se font 100 % avec Claude Code et ton navigateur. Zéro achat, zéro rendez-vous.
- La dopamine est ton moteur : coche les cases, mets la date à côté, regarde la liste se remplir.
- Tu as le droit de jouer une partie « pour le fun » et d'appeler ça un playtest. C'en est un.
