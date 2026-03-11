export interface SituationLot {
  numero: number;
  nombreInitial: number;
  prixAchatTotal: number;
  valeurNourritureConsommee: number;
  poidsMoyenSansMort: number;
  poidsMoyenAvecMort: number;
  prixVenteSansMort: number;
  nombreMorts: number;
  nombreApresMort: number;
  ageEnJour: number;
  ageEnSemaine: number;
  prixVenteAvecMort: number;
  nombreOeufs: number;
  valeurOeufs: number;
  beneficeSansMort: number;
  beneficeAvecMort: number;
}

export interface SituationLotsResponse {
  date: string;
  nombreLots: number;
  situations: SituationLot[];
}
