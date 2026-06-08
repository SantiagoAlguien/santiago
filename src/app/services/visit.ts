import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../core/config/api.config';
import { VisitRequest } from '../core/models/visit.model';

@Injectable({ providedIn: 'root' })
export class VisitService {
  constructor(private http: HttpClient) {}

  registerVisit(blogId: number): Observable<unknown> {
    const body: VisitRequest = {
      blogId,
      visitorIp: 'dynamic',
    };
    return this.http.post(`${API_BASE}/visits`, body);
  }
}
