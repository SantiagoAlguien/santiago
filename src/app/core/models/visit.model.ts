export interface VisitRequest {
  ip: string;
  visitType: 'CV' | 'BLOG';
  blogId?: number;
}
