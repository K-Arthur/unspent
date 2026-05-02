import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function authorizeJob(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const secret = Deno.env.get('PROCESS_VESTED_SECRET');
  if (!secret) {
    return { ok: false, status: 500, error: 'Job secret not configured' };
  }

  if (req.headers.get('x-cron-secret') !== secret) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}

interface VoteResult {
  buy: number;
  pass: number;
  dupe: number;
  winner: 'buy' | 'pass' | 'dupe' | null;
  price: number;
}

async function processVoteOutcome(
  supabase: ReturnType<typeof createClient>,
  itemId: string
): Promise<VoteResult | null> {
  // Get item details
  const { data: item, error: itemError } = await supabase
    .from('wishlist_items')
    .select('*, profiles(username)')
    .eq('id', itemId)
    .single();

  if (itemError || !item) {
    console.error('Item not found:', itemError);
    return null;
  }

  // Get all votes for this item
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('wishlist_item_id', itemId);

  if (votesError) {
    console.error('Votes error:', votesError);
    return null;
  }

  const counts = { buy: 0, pass: 0, dupe: 0 };
  (votes || []).forEach((v) => {
    counts[v.vote_type as 'buy' | 'pass' | 'dupe']++;
  });

  const total = counts.buy + counts.pass + counts.dupe;
  const threshold = 3;

  let winner: 'buy' | 'pass' | 'dupe' | null = null;

  if (total >= threshold) {
    if (counts.buy > counts.pass && counts.buy > counts.dupe) {
      winner = 'buy';
    } else if (counts.pass > counts.buy && counts.pass > counts.dupe) {
      winner = 'pass';
    } else if (counts.dupe > counts.buy && counts.dupe > counts.pass) {
      winner = 'dupe';
    }
  } else {
    // Default to pass if not enough votes (silent = probably don't need it)
    winner = 'pass';
  }

  // Update item status based on outcome
  let newStatus = 'expired';
  
  if (winner === 'buy') {
    newStatus = 'purchased';
  } else if (winner === 'dupe') {
    newStatus = 'dupe_found';
  } else {
    newStatus = 'expired';
  }

  const { error: updateError } = await supabase
    .from('wishlist_items')
    .update({
      status: newStatus,
      voted_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (updateError) {
    console.error('Update error:', updateError);
  }

  // If pass or dupe, record savings
  if ((winner === 'pass' || winner === 'dupe') && item.price > 0) {
    await supabase.from('savings_tallies').upsert({
      user_id: item.user_id,
      item_id: itemId,
      amount_saved: item.price,
    }, {
      onConflict: 'item_id',
    });

    // Update user's total saved
    await supabase.rpc('increment_savings', {
      user_id: item.user_id,
      amount: item.price,
    });

    // Send notification (would integrate with Expo Push in production)
    console.log(`User ${item.user_id} saved $${item.price / 100} from ${item.title}`);
  }

  // If dupe, trigger dupe search
  if (winner === 'dupe') {
    // Call dupe search function
    const dupeSearchUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/search-dupes`;
    await fetch(dupeSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY')}`,
      },
      body: JSON.stringify({ itemId }),
    });
  }

  return {
    ...counts,
    winner,
    price: item.price,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!['GET', 'POST'].includes(req.method)) {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authorization = authorizeJob(req);
  if (!authorization.ok) {
    return jsonResponse({ error: authorization.error }, authorization.status);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ error: 'Server misconfiguration' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get items that need processing (expired cooldown)
    const { data: expiredItems, error } = await supabase
      .from('wishlist_items')
      .select('id, cooldown_ends_at')
      .eq('status', 'cooling_off')
      .lte('cooldown_ends_at', new Date().toISOString())
      .limit(10);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    const results = [];
    for (const item of expiredItems || []) {
      const result = await processVoteOutcome(supabase, item.id);
      if (result) {
        results.push({ itemId: item.id, ...result });
      }
    }

    return jsonResponse({ processed: results.length, results });
  } catch (error) {
    console.error('Process vested error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
