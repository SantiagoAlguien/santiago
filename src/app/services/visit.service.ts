import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../core/config/api.config';
import { VisitRequest } from '../core/models/visit.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  constructor(private http: HttpClient) {}

  registerBlogVisit(blogId: number): Observable<unknown> {
    const body: VisitRequest = { ip: '0.0.0.0', visitType: 'BLOG', blogId };
    return this.http.post(`${API_BASE}/visits`, body);
  }

  getBlogVisitCount(blogId: number): Observable<number> {
    const params = new HttpParams().set('visitType', 'BLOG').set('blogId', blogId);
    return this.http.get<number>(`${API_BASE}/visits/count`, { params });
  }
}
