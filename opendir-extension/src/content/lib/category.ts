import type { DirectoryItem } from '../types';

export interface CategoryStyle {
  label: string;
  text: string;
  border: string;
  bg: string;
  badge: string;
}

export function getCategoryStyle(item: DirectoryItem): CategoryStyle {
  if (item.type === 'directory' || item.isParent) {
    return {
      label: 'Folder',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
    };
  }

  switch (item.fileType) {
    case 'image':
      return {
        label: 'Image',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        bg: 'bg-green-50 dark:bg-green-950/40',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
      };
    case 'video':
      return {
        label: 'Video',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200',
      };
    case 'audio':
      return {
        label: 'Audio',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
      };
    case 'document':
      return {
        label: 'Document',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        bg: 'bg-red-50 dark:bg-red-950/40',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
      };
    case 'code':
      return {
        label: 'Code',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
        bg: 'bg-cyan-50 dark:bg-cyan-950/40',
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
      };
    case 'archive':
      return {
        label: 'Archive',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        bg: 'bg-yellow-50 dark:bg-yellow-950/40',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
      };
    default:
      return {
        label: item.ext?.toUpperCase() || 'File',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        bg: 'bg-gray-50 dark:bg-gray-900/40',
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      };
  }
}
