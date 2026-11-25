import { getInventory } from '@/lib/inventory-repository';

export const dynamic = 'force-dynamic';

/**
 * Deployment diagnostic. Reports only whether credentials are present (never
 * their values) and whether Supabase reads succeed.
 */
export async function GET() {
  const env = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NEXT_PUBLIC_JWKS_URL: Boolean(process.env.NEXT_PUBLIC_JWKS_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  };

  try {
    const data = await getInventory();
    return Response.json({
      ok: true,
      env,
      counts: {
        items: data.items.length,
        purchases: data.purchases.length,
        sales: data.sales.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json(
      { ok: false, env, error: message.slice(0, 300) },
      { status: 500 },
    );
  }
}
