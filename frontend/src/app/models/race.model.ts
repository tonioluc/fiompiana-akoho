/**
 * Interface TypeScript pour Race.
 *
 * Correspond au modèle Race du backend Express (models/race.model.js) :
 *   { Id_race, nom, prix_sakafo, prix_vente_lahy, prix_vente_vavy, prix_vente_atody, nombre_jour_foy, capacite_pondaison }
 *
 * Utilisé dans le select du formulaire de DescriptionRace
 * pour afficher le nom de la race au lieu d'un simple ID.
 */
export interface Race {
  Id_race: number | null;
  nom: string;
  prix_sakafo: number;
  prix_vente_lahy: number;
  prix_vente_vavy: number;
  prix_vente_atody: number;
  nombre_jour_foy: number;
  capacite_pondaison: number;
}
