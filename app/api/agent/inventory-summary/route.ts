import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
// import { initialInventory } from '@/lib/mockData'; // Disabled - Supabase only

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-agent-key') || req.headers.get('authorization');
    const validKey = process.env.AGENT_API_SECRET || 'antam_agent_secure_2026';

    const cleanToken = authHeader?.replace('Bearer ', '');
    if (!cleanToken || cleanToken !== validKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Invalid x-agent-key.' },
        { status: 401 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, service_tag, device_model, brand, specs, cost_price, retail_price, qc_status, warranty_months')
        .eq('qc_status', 'ready_to_sell');

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        count: data?.length || 0,
        items: data || [],
      });
    }

    // Fallback to initial mock inventory
    return NextResponse.json({
      success: false,
      error: 'Supabase unavailable - service temporarily disabled',
      message: 'Hệ thống đang bảo trì, không thể truy cập dữ liệu kho.',
    }, { status: 500 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
