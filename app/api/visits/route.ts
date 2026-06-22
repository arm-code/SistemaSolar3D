import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * CRÍTICO para Vercel: fuerza ejecución dinámica en cada petición.
 * Sin esto, Next.js 14 App Router cachea el GET y Supabase
 * solo se llama una vez → el contador nunca incrementa.
 */
export const dynamic = 'force-dynamic';

const COUNTER_ID = 'sistema-solar';

/** User-Agents de bots/crawlers conocidos que NO deben contar como visita */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|google|bingpreview|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|curl|wget|python-requests|axios|node-fetch/i;

/**
 * GET /api/visits
 * Incrementa el contador global en Supabase y devuelve el nuevo total.
 * Filtra bots para no inflar el contador artificialmente.
 */
export async function GET(req: NextRequest) {
  // --- Filtrar bots/crawlers ---
  const userAgent = req.headers.get('user-agent') ?? '';
  if (BOT_PATTERN.test(userAgent)) {
    // Devolvemos el conteo actual sin incrementar
    const { data } = await supabaseAdmin
      .from('visit_counter')
      .select('count')
      .eq('id', COUNTER_ID)
      .single();

    return NextResponse.json(
      { count: (data?.count as number) ?? 0 },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('increment_visit_count', {
      counter_id: COUNTER_ID,
    });

    if (error) {
      console.error('[visits] Error Supabase RPC:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { count: data as number },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      },
    );
  } catch (err) {
    console.error('[visits] Error inesperado:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
