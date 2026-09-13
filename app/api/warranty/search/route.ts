import { NextRequest, NextResponse } from 'next/server';
import { initialInventory, initialTickets, initialCustomers } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  const cleanQuery = q.toLowerCase();
  const digitsOnly = q.replace(/\D/g, '');

  // 1. Search in Inventory
  const matchedItem = initialInventory.find(
    (item) =>
      item.service_tag.toLowerCase() === cleanQuery ||
      item.serial_number?.toLowerCase() === cleanQuery
  );

  // 2. Search in Tickets (By Code, Tag or Customer Phone)
  const matchedTicket = initialTickets.find((ticket) => {
    const phoneDigits = ticket.customer_phone.replace(/\D/g, '');
    return (
      ticket.ticket_code.toLowerCase() === cleanQuery ||
      (ticket.service_tag && ticket.service_tag.toLowerCase() === cleanQuery) ||
      (digitsOnly.length >= 9 && phoneDigits.includes(digitsOnly))
    );
  });

  // 3. Search in Customers
  const matchedCustomer = initialCustomers.find((c) => {
    const phoneDigits = c.phone.replace(/\D/g, '');
    return digitsOnly.length >= 9 && phoneDigits.includes(digitsOnly);
  });

  if (!matchedItem && !matchedTicket && !matchedCustomer) {
    return NextResponse.json(
      { found: false, message: 'Không tìm thấy dữ liệu bảo hành cho thông tin đã nhập.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    query: q,
    data: {
      item: matchedItem || null,
      ticket: matchedTicket || null,
      customer: matchedCustomer || null,
    },
  });
}
