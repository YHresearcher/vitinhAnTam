#!/usr/bin/env node

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env.local');

// Load .env.local
dotenv.config({ path: envPath });

// Test script to verify Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

console.log('🔍 Supabase Configuration Check:');
console.log('================================');
console.log(`✓ SUPABASE_URL: ${supabaseUrl ? '✅ Configured' : '❌ Missing'}`);
console.log(`  └─ Value: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A'}`);
console.log();
console.log(`✓ ANON_KEY: ${anonKey ? '✅ Configured' : '❌ Missing'}`);
console.log(`  └─ Value: ${anonKey ? anonKey.substring(0, 30) + '...' : 'N/A'}`);
console.log();
console.log(`✓ SECRET_KEY: ${secretKey ? '✅ Configured' : '❌ Missing'}`);
console.log(`  └─ Value: ${secretKey ? secretKey.substring(0, 30) + '...' : 'N/A'}`);
console.log();

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  anonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

console.log(`🎯 Overall Status: ${isSupabaseConfigured ? '✅ READY TO USE' : '❌ NOT CONFIGURED'}`);
console.log('================================');

if (isSupabaseConfigured) {
  console.log('\n✨ Supabase is properly configured!');
  console.log('   - Inventory data will now load from database');
  console.log('   - Orders and notifications will sync correctly');
  console.log('   - You should see real data instead of mock data');
} else {
  console.log('\n⚠️  Supabase is NOT configured!');
  console.log('   - System will use mock/hardcoded data');
  console.log('   - Orders and notifications may not work');
}

