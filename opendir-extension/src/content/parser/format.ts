import {
  ARCHIVE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  CODE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../types';
import type { FileType } from '../types';

export function classifyExtension(ext: string | undefined): FileType | undefined {
  if (!ext) return undefined;
  const lower = ext.toLowerCase();
  if (IMAGE_EXTENSIONS.has(lower)) return 'image';
  if (VIDEO_EXTENSIONS.has(lower)) return 'video';
  if (AUDIO_EXTENSIONS.has(lower)) return 'audio';
  if (DOCUMENT_EXTENSIONS.has(lower)) return 'document';
  if (CODE_EXTENSIONS.has(lower)) return 'code';
  if (ARCHIVE_EXTENSIONS.has(lower)) return 'archive';
  return 'default';
}

export function getExtension(name: string): string | undefined {
  if (name.endsWith('/')) return undefined;
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return undefined;
  return name.slice(dot + 1).toLowerCase();
}

export function isDirectoryName(name: string, href: string): boolean {
  return name.endsWith('/') || href.endsWith('/') || !name.includes('.');
}

export function formatSize(raw: string | number | undefined): string {
  if (raw === undefined || raw === null || raw === '') return '—';
  if (typeof raw === 'number') return formatBytes(raw);

  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-') return '—';

  const apacheMatch = trimmed.match(/^([\d.]+)\s*([KMG])?$/i);
  if (apacheMatch) {
    const value = parseFloat(apacheMatch[1]);
    const suffix = apacheMatch[2]?.toUpperCase();
    const multipliers: Record<string, number> = { K: 1024, M: 1024 ** 2, G: 1024 ** 3 };
    const bytes = suffix ? value * (multipliers[suffix] ?? 1) : value;
    return formatBytes(bytes);
  }

  const numeric = Number(trimmed.replace(/,/g, ''));
  if (!Number.isNaN(numeric)) return formatBytes(numeric);
  return trimmed;
}

export function parseSizeToBytes(raw: string | number | undefined): number {
  if (typeof raw === 'number') return raw;
  if (!raw) return 0;
  const trimmed = raw.trim();
  const apacheMatch = trimmed.match(/^([\d.]+)\s*([KMG])?$/i);
  if (apacheMatch) {
    const value = parseFloat(apacheMatch[1]);
    const suffix = apacheMatch[2]?.toUpperCase();
    const multipliers: Record<string, number> = { K: 1024, M: 1024 ** 2, G: 1024 ** 3 };
    return suffix ? value * (multipliers[suffix] ?? 1) : value;
  }
  const numeric = Number(trimmed.replace(/,/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-') return undefined;

  const apache = trimmed.match(/^(\d{2})-(\w{3})-(\d{4})\s+(\d{2}):(\d{2})/i);
  if (apache) {
    const month = MONTHS[apache[2].slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      return new Date(
        Number(apache[3]),
        month,
        Number(apache[1]),
        Number(apache[4]),
        Number(apache[5]),
      );
    }
  }

  const iso = Date.parse(trimmed);
  if (!Number.isNaN(iso)) return new Date(iso);

  const us = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (us) {
    const year = us[3].length === 2 ? 2000 + Number(us[3]) : Number(us[3]);
    return new Date(
      year,
      Number(us[1]) - 1,
      Number(us[2]),
      Number(us[4] ?? 0),
      Number(us[5] ?? 0),
      Number(us[6] ?? 0),
    );
  }

  return undefined;
}

export function formatDate(raw: string | undefined): string {
  const date = parseDate(raw);
  if (!date) return raw?.trim() || '—';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${mm}/${dd}/${yy} ${hh}:${min}:${ss}`;
}
