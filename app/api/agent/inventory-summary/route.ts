import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isValidAgentKey } from '@/lib/server/agentAuth';

export async function GET(req: NextRequest) {
  try {
    if (!isValidAgentKey(req)) {
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

    return NextResponse.json({
      success: true,
      count: 0,
      items: [],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
