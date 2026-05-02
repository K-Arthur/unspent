import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
const webUrl = Deno.env.get('NEXT_PUBLIC_WEB_URL') ?? 'http://localhost:3000';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function safeRedirectUrl(candidate: string | undefined, fallback: string): string {
  if (!candidate) return fallback;

  try {
    const parsed = new URL(candidate);
    const allowedOrigin = new URL(webUrl).origin;
    return parsed.origin === allowedOrigin ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!stripeApiKey) {
    return jsonResponse({ error: 'Payment processing not configured' }, 500);
  }

  try {
    const { priceId, successUrl, cancelUrl, plan } = await req.json();
    const selectedPlan = plan === 'yearly' ? 'yearly' : 'monthly';
    const configuredPriceId = selectedPlan === 'yearly'
      ? Deno.env.get('STRIPE_PRICE_YEARLY')
      : Deno.env.get('STRIPE_PRICE_MONTHLY');
    const configuredPriceIds = [
      Deno.env.get('STRIPE_PRICE_MONTHLY'),
      Deno.env.get('STRIPE_PRICE_YEARLY'),
    ].filter(Boolean);

    const checkoutPriceId = configuredPriceId ?? priceId;

    if (!checkoutPriceId || (configuredPriceIds.length > 0 && !configuredPriceIds.includes(checkoutPriceId))) {
      return jsonResponse({ error: 'Invalid subscription plan' }, 400);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ error: 'Server misconfiguration' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2023-10-16',
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: checkoutPriceId,
          quantity: 1,
        },
      ],
      success_url: safeRedirectUrl(successUrl, `${webUrl}/upgrade?success=true`),
      cancel_url: safeRedirectUrl(cancelUrl, `${webUrl}/upgrade?canceled=true`),
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan: selectedPlan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: selectedPlan,
        },
      },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return jsonResponse({ error: 'Failed to create checkout session' }, 500);
  }
});
