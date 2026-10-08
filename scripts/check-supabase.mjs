#!/usr/bin/env node
/**
 * Kiểm tra dữ liệu trong Supabase
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Supabase not configured!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

async function checkData() {
  console.log('🔍 Checking Supabase tables...\n');

  // 1. Inventory Items
  const { data: inventory, error: invErr } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);
  
  console.log(`📦 inventory_items: ${inventory?.length || 0} rows`);
  if (invErr) console.log(`   ❌ Error: ${invErr.message}`);
  if (inventory && inventory.length > 0) {
    console.log(`   - Sẵn sàng bán: ${inventory.filter(i => i.qc_status === 'ready_to_sell').length}`);
    console.log(`   - Đã bán: ${inventory.filter(i => i.qc_status === 'sold').length}`);
    console.log(`   - Đang check: ${inventory.filter(i => i.qc_status === 'checking').length}`);
    inventory.slice(0, 3).forEach(i => {
      console.log(`   ▶ ${i.device_model || i.model || i.service_tag} | ${i.qc_status} | Giá: ${i.retail_price || i.price || 0}`);
    });
  }
  console.log();

  // 2. Orders
  const { data: orders, error: ordErr } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (!ordErr && orders) {
    console.log(`📋 orders: ${orders.length} rows`);
    orders.slice(0, 3).forEach(o => {
      console.log(`   ▶ ${o.order_code || o.id} | ${o.customer_name} | ${o.status || 'pending'}`);
    });
  } else {
    console.log(`📋 orders: Table not found or empty`);
    if (ordErr) console.log(`   ❌ Error: ${ordErr.message}`);
  }
  console.log();

  // 3. Check all tables
  const tables = ['customers', 'service_tickets', 'onsite_dispatches', 'notifications', 'software_licenses', 'users'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error && data) {
      console.log(`✅ ${table}: tồn tại (${data.length}+ rows)`);
    } else if (error && error.code === '42P01') {
      console.log(`⚠️  ${table}: chưa tạo bảng`);
    } else if (error) {
      console.log(`⚠️  ${table}: ${error.message}`);
    }
  }
}

checkData().catch(console.error);
