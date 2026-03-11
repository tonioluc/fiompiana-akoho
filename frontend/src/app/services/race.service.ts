/**
 * Service pour les appels API de Race.
 *
 * Gère toutes les opérations CRUD sur la table Race.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Race } from '../models/race.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RaceService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/races`;

  /** Récupérer toutes les races */
  getAll(): Observable<Race[]> {
    return this.http.get<Race[]>(this.baseUrl);
  }

  /** Récupérer une race par son ID */
  getById(id: number): Observable<Race> {
    return this.http.get<Race>(`${this.baseUrl}/${id}`);
  }

  /** Créer une nouvelle race */
  create(race: Race): Observable<Race> {
    return this.http.post<Race>(this.baseUrl, race);
  }

  /** Mettre à jour une race existante */
  update(id: number, race: Race): Observable<Race> {
    return this.http.put<Race>(`${this.baseUrl}/${id}`, race);
  }

  /** Supprimer une race par son ID */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Calculer le poids d'un poulet d'une race entre deux dates */
  getPoidsAkoho(raceId: number, dateDebut: string, dateFin: string): Observable<PoidsAkohoResponse> {
    return this.http.get<PoidsAkohoResponse>(
      `${this.baseUrl}/${raceId}/poids-akoho`,
      { params: { dateDebut, dateFin } }
    );
  }
}

export interface PoidsAkohoResponse {
  raceId: number;
  raceName: string;
  dateDebut: string;
  dateFin: string;
  joursPresence: number;
  ageEnSemaine: number;
  poidsGrammes: number;
}
