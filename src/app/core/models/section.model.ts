export interface Section {
  id: number;
  name: string;
  description: string;
  blogIds: number[];
  imagesUrl: string[];
}

export interface SectionFormModel {
  name: string;
  description: string;
  blogIds: number[];
  imagesUrl: string[];
}
