import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NaissanceOeuf } from '../models/naissance-oeuf.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NaissanceOeufService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/naissances-oeuf`;

  getAll(): Observable<NaissanceOeuf[]> {
    return this.http.get<NaissanceOeuf[]>(this.baseUrl);
  }

  getById(id: number): Observable<NaissanceOeuf> {
    return this.http.get<NaissanceOeuf>(`${this.baseUrl}/${id}`);
  }

  create(item: NaissanceOeuf): Observable<NaissanceOeuf> {
    return this.http.post<NaissanceOeuf>(this.baseUrl, item);
  }

  update(id: number, item: NaissanceOeuf): Observable<NaissanceOeuf> {
    return this.http.put<NaissanceOeuf>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
