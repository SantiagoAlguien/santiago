import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../core/config/api.config';
import { Blog } from '../core/models/blog.model';
import { Section } from '../core/models/section.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly apiUrl = `${API_BASE}/blogs`;

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  getBlogSections(id: number): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/${id}/sections`);
  }

  createBlog(blog: Partial<Blog>): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blog);
  }

  updateBlog(id: number, blog: Partial<Blog>): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${id}`, blog);
  }

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
