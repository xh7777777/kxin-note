export interface INote {
  id: string;
  metadata: INoteMetadata;
  status: INoteStatus;
}

export interface INoteMetadata {
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  icon?: string;
  cover?: string;
  tags?: string[];
}
export interface INoteStatus {
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isTrashed: boolean;
}
