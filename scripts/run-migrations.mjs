#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('❌ Require SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local');
  process.exit(1);
}

// Bắt buộc dùng REST API trực tiếp vì Client Supabase-JS không hỗ trợ execute raw SQL string dễ dàng
async function runSql(sql) {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': secretKey,
      'Authorization': `Bearer ${secretKey}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!res.ok) {
     // Thử pgcrypto extension hoặc query rpc if available
     console.log("   --- (API REST không hỗ trợ raw SQL, chuyển sang RPC)")
  }
}

console.log('🔄 Đang kiểm tra schema...');
const supabase = createClient(supabaseUrl, secretKey);

async function applyMigrations() {
  const supabasePath = join(__dirname, '../supabase');
  if (!existsSync(supabasePath)) return;

  const files = ['schema.sql', 'migration-orders-reservation.sql', 'rls-policies.sql', 'migration-blog.sql'];

  for (const file of files) {
    const fullPath = join(supabasePath, file);
    if (!existsSync(fullPath)) continue;
    console.log(`\n📄 Đang đọc file: ${file}`);
    const sql = readFileSync(fullPath, 'utf8');
    
    // Vì không có quyền postgreSQL direct access, ta sẽ log để người dùng biết tự chạy
    // Tuy nhiên một số tools bên ngoài có thể.
  }
  
  console.log('\n--- VUI LÒNG ĐẢM BẢO BẠN ĐÃ CHẠY CÁC FILE SQL TRONG PANEL SUPABASE ---');
  console.log('1. schema.sql');
  console.log('2. migration-orders-reservation.sql');
  console.log('3. rls-policies.sql');
}

applyMigrations();
