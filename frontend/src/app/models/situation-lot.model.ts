export interface SituationLot {
  numero: number;
  ageEnSemaine: number;
  nombreMorts: number;
  pouletRestant: number;
  poidsMoyen: number;
  poidsTotalRestant: number;
  nombreOeuf: number;
  prixVenteTotal: number;
  valeurOeufsRestants: number;
  valeurNourritureConsommee: number;
  prixAchatTotal: number;
  benefice: number;
}

export interface SituationLotsResponse {
  date: string;
  nombreLots: number;
  situations: SituationLot[];
}
