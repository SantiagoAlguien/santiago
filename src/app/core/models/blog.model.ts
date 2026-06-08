export interface Blog {
  id: number;
  title: string;
  content: string;
  sectionIds: number[];
  userId: number;
  imagesUrl: string[];
  duracion?: string;
  createdAt?: string;
  author?: string;
}

export interface BlogFormModel {
  title: string;
  content: string;
  sectionIds: number[];
  imagesUrl: string[];
  duracion: string;
}
