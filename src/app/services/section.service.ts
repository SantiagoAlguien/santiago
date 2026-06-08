import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../core/config/api.config';
import { Section } from '../core/models/section.model';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private readonly apiUrl = `${API_BASE}/sections`;

  constructor(private http: HttpClient) {}

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(this.apiUrl);
  }

  getSectionById(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}`);
  }

  createSection(section: Partial<Section>): Observable<Section> {
    return this.http.post<Section>(this.apiUrl, section);
  }

  updateSection(id: number, section: Partial<Section>): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/${id}`, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
