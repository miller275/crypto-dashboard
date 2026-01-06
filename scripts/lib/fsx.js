import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

export async function writeJson(filePath, data) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json + '\n', 'utf8');
}

export async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

export async function writeFile(filePath, buffer) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await fs.writeFile(filePath, buffer);
}

export function extFromContentType(ct = '') {
  const v = ct.split(';')[0].trim().toLowerCase();
  if (v === 'image/png') return '.png';
  if (v === 'image/svg+xml') return '.svg';
  if (v === 'image/jpeg') return '.jpg';
  if (v === 'image/webp') return '.webp';
  return '';
}
