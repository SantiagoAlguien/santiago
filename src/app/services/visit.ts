import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private apiUrl = '/backend/api/visits';

  constructor(private http: HttpClient) {}

  registerVisit(): Observable<number> {
    return this.http.post<number>(this.apiUrl, {});
  }

  getVisitCount(): Observable<number> {
    return this.http.get<number>(this.apiUrl + '/count');
  }

  checkVisit(): Observable<boolean> {
    return this.http.get<boolean>(this.apiUrl + '/check');
  }

}