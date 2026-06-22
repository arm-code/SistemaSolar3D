import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const COUNTER_ID = 'sistema-solar';

/**
 * GET /api/visits
 * Incrementa el contador global en Supabase y devuelve el nuevo total.
 * Se llama desde el cliente al cargar la app.
 */
export async function GET() {
  try {
    // Llamamos a la función RPC atómica definida en Supabase
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
          // No cachear: cada petición debe incrementar
          'Cache-Control': 'no-store, no-cache, must-revalidate',
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
