import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtodyLamokany } from '../models/atody-lamokany.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtodyLamokanyService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/atody-lamokany`;

  getAll(): Observable<AtodyLamokany[]> {
    return this.http.get<AtodyLamokany[]>(this.baseUrl);
  }

  getById(id: number): Observable<AtodyLamokany> {
    return this.http.get<AtodyLamokany>(`${this.baseUrl}/${id}`);
  }

  create(item: AtodyLamokany): Observable<AtodyLamokany> {
    return this.http.post<AtodyLamokany>(this.baseUrl, item);
  }

  update(id: number, item: AtodyLamokany): Observable<AtodyLamokany> {
    return this.http.put<AtodyLamokany>(`${this.baseUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
