import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Loads .env.local and .env from frontend/ without requiring dotenv.
 * Existing process.env values always win, so CI/Vercel variables are respected.
 */
export function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const filePath = resolve(frontendRoot, name);
    if (!existsSync(filePath)) continue;

    const contents = readFileSync(filePath, 'utf8');

    contents.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) return;

      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) return;

      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    });
  }
}

export function envValue(...keys) {
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
  }

  return '';
}

export function requireEnv(keys, label) {
  const value = envValue(...keys);

  if (!value) {
    console.error(`\nMissing ${label}. Set ${keys.join(' or ')} in frontend/.env.local (never commit it).\n`);
    process.exit(1);
  }

  return value;
}

export function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--') && !arg.includes('=')));
  const values = {};

  args.forEach((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) values[match[1]] = match[2];
  });

  return { args, flags, values };
}
