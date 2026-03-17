# Suite du sujet - Fiompiana Akoho (version détaillée)

## 1) Incubation automatique des oeufs (kotrehina automatique)

### Règle principale
- Chaque saisie d'oeufs destinés à l'incubation déclenche automatiquement une incubation.
- Les oeufs incubés sont rattachés à un lot d'oeufs source.
- La durée d'incubation est fixe: 30 jours.

### Comportement attendu
- Date de départ incubation = date de saisie des oeufs incubés.
- Date théorique d'éclosion = date de départ + 30 jours.
- Le système doit pouvoir lister les incubations en cours, prêtes à éclore, et terminées.

### Exemple
- 01/03: 100 oeufs incubés automatiquement.
- Date d'éclosion prévue: 31/03.

## 2) Capacite de ponte au niveau race

### Nouvelle donnée dans Race
- Ajouter un champ de capacité de ponte (par poule femelle, sur un cycle de vie):
	- `capacite_ponte_cycle` (nombre d'oeufs maximum par femelle sur le cycle).

### Règle de calcul du potentiel max d'oeufs
- Seules les femelles pondent.
- Potentiel max d'un lot:

$$
Potentiel\_max\_oeufs = Nb\_femelles \times capacite\_ponte\_cycle
$$

### Exemple (repris de tes notes)
- Si on a 100 poules femelles.
- Si `capacite_ponte_cycle = 40`.
- Alors:

$$
100 \times 40 = 4000\ oeufs\ max
$$

## 3) Gestion du pourcentage mâles/femelles (lahy sy vavy)

### Données à saisir
- Le système doit gérer la répartition sexuelle en pourcentage:
	- `% vavy` (femelles)
	- `% lahy` (mâles)

### Contraintes
- `% vavy + % lahy = 100`.
- La saisie doit accepter des décimales (avec virgule ou point).
	- Exemples valides: `52,5` ou `52.5`.

### Règle d'application
- Après éclosion (sur les poussins viables), on applique cette répartition pour obtenir:
	- nombre de femelles
	- nombre de mâles

## 4) Gestion du % lamokany et % velona

### Définition
- `lamokany`: non viable / perdu.
- `velona` (ou foy): viable / vivant.

### Saisie demandée
- Lors de la saisie de l'éclosion, indiquer:
	- `% lamokany`
	- `% velona`

### Contraintes
- `% lamokany + % velona = 100`.
- Accepter les décimales (virgule ou point).

### Calcul
- Soit `N` le nombre d'oeufs incubés.

$$
Nb\_lamokany = N \times \frac{\%lamokany}{100}
$$

$$
Nb\_velona = N \times \frac{\%velona}{100}
$$

- Ensuite, la répartition mâles/femelles est appliquée sur `Nb_velona`.

## 5) Flux métier complet recommandé

1. Saisie des oeufs incubés (automatique en incubation).
2. Calcul et stockage de la date d'éclosion prévue (J+30).
3. Le jour de l'éclosion: saisie `% lamokany` et `% velona`.
4. Calcul des quantités lamokany/velona.
5. Saisie (ou application par défaut) des `% vavy/% lahy`.
6. Calcul `nb_vavy` et `nb_lahy` à partir des velona.
7. Création d'un nouveau lot de poussins à partir des velona.
8. Envoi des lamokany vers les pertes (tableau de bord), rattachées au lot d'oeufs source.

## 6) Exemple détaillé basé sur tes notes

### Données initiales
- 01/03: incuber 100 oeufs.
- Incubation automatique activée.
- Durée incubation: 30 jours.

### Étape A - Éclosion
- Exemple de paramétrage: `60% lamokany` et `40% velona`.

Calcul:

$$
Nb\_lamokany = 100 \times 0,60 = 60
$$

$$
Nb\_velona = 100 \times 0,40 = 40
$$

### Étape B - Répartition sexuelle sur les velona
- Exemple: `70% vavy` et `30% lahy`.

Calcul:

$$
Nb\_vavy = 40 \times 0,70 = 28
$$

$$
Nb\_lahy = 40 \times 0,30 = 12
$$

### Résultat attendu
- Nouveau lot poussins créé avec 40 sujets:
	- 28 femelles
	- 12 mâles
- Pertes enregistrées:
	- 60 lamokany
	- rattachées au lot d'oeufs incubé du 01/03.

## 7) Cas particulier mentionné dans tes notes

Tu as donné l'exemple:
- 01/03: 100 oeufs incubés.
- 02/03: 200 (autre saisie).

Interprétation recommandée:
- Ce sont 2 opérations d'incubation distinctes (donc 2 enregistrements), sauf si le même lot est explicitement fusionné.
- Chaque opération garde sa propre date d'éclosion prévue (J+30).

## 8) Règles d'arrondi et cohérence (important)

Pour éviter les écarts quand on utilise des pourcentages avec décimales:
- Faire les calculs en décimal.
- Arrondir à l'entier le plus proche uniquement à l'affichage ou à la validation finale.
- Garantir la cohérence:
	- `nb_lamokany + nb_velona = nb_oeufs_incubes`
	- `nb_vavy + nb_lahy = nb_velona`

Si un écart de 1 apparaît à cause de l'arrondi, l'ajuster sur la catégorie majoritaire.

## 9) Impact tableau de bord

Le tableau de bord doit afficher au minimum:
- Total oeufs incubés.
- Total éclosions (velona).
- Total pertes (lamokany).
- Taux de survie global:

$$
Taux\_survie = \frac{Total\_velona}{Total\_incubes} \times 100
$$

- Taux de perte global:

$$
Taux\_perte = \frac{Total\_lamokany}{Total\_incubes} \times 100
$$

Les pertes doivent être visibles par lot d'origine (traçabilité).

## 10) Résumé métier simple

- Incubation: automatique, 30 jours.
- Éclosion: on sépare velona vs lamokany en pourcentage.
- Sur les velona: on répartit vavy vs lahy.
- Les lamokany vont dans les pertes du lot d'oeufs source.
- Les velona créent un nouveau lot de poussins.
