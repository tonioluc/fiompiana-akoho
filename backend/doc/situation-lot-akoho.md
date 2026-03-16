# Situation d'un Lot Akoho — Règles de gestion

## Endpoint

```
GET /api/lots-akoho/:id/situation?date=YYYY-MM-DD
```

Retourne la situation complète d'un lot de poulets à une date donnée.

---

## 1. Données d'entrée

On a besoin de :

| Source | Données |
|---|---|
| `lot_akoho` | `numero`, `date_entree`, `nombre`, `age` (semaine), `prix_achat`, `Id_race` |
| `race` | `prix_sakafo` (prix nourriture/gramme), `prix_vente` (prix vente/gramme de poulet), `prix_vente_atody` (prix vente unitaire d'un œuf) |
| `description_race` | Liste triée par `age` (semaine) : `variation_poids` (grammes gagnés cette semaine), `lanja_sakafo` (grammes de nourriture consommés par poulet cette semaine) |
| `akoho_maty` | `date_mort`, `nombre` — chaque événement de mort dans le lot |
| `lot_atody` | Lots d'œufs rattachés au lot akoho |
| `naissance_oeuf` | Poussins nés (œufs éclos) — à soustraire du stock d'œufs |
| `atody_lamokany` | Œufs pourris (gâtés) — à soustraire du stock d'œufs |

---

## 2. Calculs détaillés

### 2.1. Âge du lot

```
jourDepuisEntree = (date_demandee - date_entree) en jours
ageActuel (semaine) = age_entree + (jourDepuisEntree / 7)
```

### 2.2. Poids moyen par poulet

On cumule les `variation_poids` de chaque semaine **depuis la semaine 0** (naissance) jusqu'à l'âge actuel.

> ⚠️ Même si le lot est entré à la semaine 2, le poulet avait déjà accumulé du poids depuis la semaine 0 (il est né avant d'être acheté). Donc le poids moyen prend en compte **toute la vie** du poulet.

```
poidsMoyen = Σ variation_poids[semaine 0 → semaine actuelle]
```

Pour la fraction de semaine en cours (ex: âge = 3.4 semaines), on ajoute :

```
+ variation_poids[semaine 3] × 0.4
```

### 2.3. Valeur de la nourriture consommée (par tranche de vie)

C'est le calcul le plus important. On ne nourrit **que les poulets vivants**, donc chaque groupe de morts a une durée de nourriture différente.

#### Principe

```
Nourriture totale = nourriture des survivants + Σ nourriture de chaque groupe de morts
```

#### Fonction utilitaire : `calculerNourritureParPoulet(ageEntree, joursPresence, descMap)`

Calcule les grammes consommés par **1 poulet** pendant `joursPresence` jours :

```
grammes = Σ lanja_sakafo[semaine_entree → semaine_fin]
```

> ⚠️ Pour la nourriture, on ne compte que **depuis la semaine d'entrée** (contrairement au poids). On ne payait pas la nourriture avant d'acheter le poulet.

#### Exemple concret

| Donnée | Valeur |
|---|---|
| Date entrée | 2 Mars |
| Age à l'entrée | Semaine 0 |
| Nombre initial | 100 poulets |
| 30 morts le | 3 Mars (1 jour de présence) |
| 20 morts le | 5 Mars (3 jours de présence) |
| Date demandée | 6 Mars (4 jours depuis l'entrée) |

Calcul :

| Groupe | Poulets | Jours nourris | Calcul |
|---|---|---|---|
| 30 morts le 3 Mars | 30 | 1 jour (2→3 Mars) | `nourriture(1j) × 30 × prix_sakafo` |
| 20 morts le 5 Mars | 20 | 3 jours (2→5 Mars) | `nourriture(3j) × 20 × prix_sakafo` |
| 50 survivants | 50 | 4 jours (2→6 Mars) | `nourriture(4j) × 50 × prix_sakafo` |
| **Total** | | | **somme des 3 lignes** |

### 2.4. Prix de vente

```
pouletRestant = nombreInitial - nombreMorts
poidsTotalRestant = poidsMoyen × pouletRestant
prixVenteTotal = poidsTotalRestant × prix_vente
```

### 2.5. Nombre d'œufs restants

```
nombreOeuf = (total lot_atody.nombre) − (naissances/poussins éclos) − (œufs pourris/lamokany)
```

Les 3 sources de diminution d'un stock d'œufs :
1. **Naissances** (`naissance_oeuf`) : les poussins sont nés → l'œuf n'existe plus
2. **Œufs pourris** (`atody_lamokany`) : les œufs gâtés → inutilisables, perdus

```
valeurOeufsRestants = nombreOeuf × prix_vente_atody
```

### 2.6. Coûts intermédiaires

```
prixAchatTotal = prix_achat × nombreInitial
benefice = prixVenteTotal + valeurOeufsRestants - prixAchatTotal - valeurNourritureConsommee
```

---

## 3. Réponse retournée

```json
{
  "numero": 101,
  "ageEnSemaine": 4,
  "nombreMorts": 50,
  "poidsMoyen": 350.5,
  "poidsTotalRestant": 17525,
  "nombreOeuf": 200,
  "prixVenteTotal": 438125,
  "valeurOeufsRestants": 100000,
  "valeurNourritureConsommee": 15000,
  "prixAchatTotal": 800000,
  "benefice": -276875
}
```

---

## 4. Fichiers impliqués dans le calcul

```
lotAkoho.service.js          ← getSituationByIdAndDate() + calculerNourritureParPoulet()
  ├── raceService             ← prix_sakafo, prix_vente, prix_vente_atody
  ├── descriptionRaceService  ← getAllByRaceId() → variation_poids, lanja_sakafo par semaine
  ├── akohoMatyService        ← getDetailsByLotAkohoIdAndDate() → date_mort + nombre (par événement)
  └── lotAtodyService          ← getNombreOeufsByLotAkohoIdAndDate()
        ├── naissanceOeufService  ← poussins nés (à soustraire)
        └── atodyLamokanyService  ← œufs pourris (à soustraire)
```

---

## 5. Tables SQL impliquées

```
race ─────────────────┐
                      │ FK
description_race ─────┤ (variation_poids, lanja_sakafo par semaine et par race)
                      │
lot_akoho ────────────┤ (le lot de poulets principal)
  │                   │
  ├── akoho_maty      │ (poulets morts : date + nombre)
  │                   │
  └── lot_atody       │ (lots d'œufs du lot de poulets)
        │
        ├── naissance_oeuf    (poussins nés → œufs éclos)
        └── atody_lamokany    (œufs pourris → à enlever du stock)
```
