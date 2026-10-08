import { NextRequest, NextResponse } from 'next/server';
// import { initialInventory, initialTickets, initialCustomers } from '@/lib/mockData';
import { initialInventory, initialTickets, initialCustomers } from '@/lib/mockData'; // These arrays are now empty, fallback disabled
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const cleanQuery = q.toLowerCase();
  const digitsOnly = q.replace(/\D/g, '');

  // 1. Try querying Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const [invRes, tckRes, cusRes] = await Promise.all([
        supabase
          .from('inventory_items')
          .select('*')
          .or(`service_tag.ilike.%${q}%,serial_number.ilike.%${q}%${digitsOnly.length >= 7 ? `,customer_phone.ilike.%${digitsOnly}%` : ''}`),
        supabase
          .from('service_tickets')
          .select('*')
          .or(`ticket_code.ilike.%${q}%,device_service_tag.ilike.%${q}%,service_tag.ilike.%${q}%${digitsOnly.length >= 7 ? `,customer_phone.ilike.%${digitsOnly}%` : ''}`),
        digitsOnly.length >= 7
          ? supabase.from('customers').select('*').ilike('phone', `%${digitsOnly}%`)
          : Promise.resolve({ data: null, error: null }),
      ]);

      const matchedItem = invRes.data && invRes.data.length > 0 ? invRes.data[0] : null;
      const matchedTicket = tckRes.data && tckRes.data.length > 0 ? tckRes.data[0] : null;
      const matchedCustomer = cusRes.data && cusRes.data.length > 0 ? cusRes.data[0] : null;

      if (matchedItem || matchedTicket || matchedCustomer) {
        return NextResponse.json({
          found: true,
          query: q,
          source: 'supabase',
          data: {
            item: matchedItem,
            ticket: matchedTicket,
            customer: matchedCustomer,
          },
        });
      }
    } catch {
      // Proceed to fallback
    }
  }

  // Fallback disabled - return 404 if Supabase fails
  return NextResponse.json(
    { found: false, message: 'Không tìm thấy dữ liệu bảo hành cho thông tin đã nhập.' },
    { status: 404 }
  );
}

