#!/usr/bin/env node
/**
 * scripts/verify-supabase.mjs
 * ───────────────────────────
 * Quick smoke-test: verifies the Supabase connection is alive and every
 * table used by the app exists and is readable via the publishable key.
 *
 * Usage:  node scripts/verify-supabase.mjs
 *
 * Note: This checks read access only. Write access depends on RLS policies
 *       (see supabase/rls-policies.sql).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually (no dotenv dependency needed)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {
  console.warn('⚠️  Could not read .env.local — using existing env vars');
}

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');

const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!url || !key) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or key in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

/** Tables that the app queries via supabase.from('...') */
const REQUIRED_TABLES = [
  'inventory_items',
  'customers',
  'service_tickets',
  'spare_parts',
  'onsite_dispatches',
  'shift_logs',
  'system_settings',
];

/** Optional tables (orders, notifications) — app handles their absence gracefully */
const OPTIONAL_TABLES = ['orders', 'notifications'];

async function checkTable(name, required = true) {
  const { data, error } = await supabase.from(name).select('id').limit(1);
  if (error) {
    const tag = required ? '❌' : '⚠️';
    console.log(`  ${tag}  ${name.padEnd(22)} ERROR ${error.code}: ${error.message}`);
    return !required; // fail only if required
  }
  console.log(`  ✅  ${name.padEnd(22)} OK  (${data.length} sample row${data.length !== 1 ? 's' : ''})`);
  return true;
}

async function main() {
  console.log('');
  console.log('🔗  Supabase URL:', url);
  console.log('🔑  Key preview :', key.slice(0, 24) + '…');
  console.log('');

  // Auth health-check
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    });
    console.log(`🩺  Auth endpoint: ${res.status === 200 ? '✅ OK' : `⚠️ ${res.status}`}`);
  } catch (err) {
    console.log(`🩺  Auth endpoint: ❌ ${err.message}`);
  }

  console.log('');
  console.log('📋  Required tables:');
  let allOk = true;
  for (const t of REQUIRED_TABLES) {
    if (!(await checkTable(t, true))) allOk = false;
  }

  console.log('');
  console.log('📋  Optional tables:');
  for (const t of OPTIONAL_TABLES) {
    await checkTable(t, false);
  }

  console.log('');
  if (allOk) {
    console.log('✨  All required tables accessible — Supabase connection verified!');
  } else {
    console.log('⛔  Some required tables are missing or inaccessible.');
    console.log('    → Run supabase/schema.sql in the Supabase SQL Editor to create them.');
    console.log('    → Then run supabase/rls-policies.sql to enable read/write access.');
    process.exit(1);
  }
}

main();
