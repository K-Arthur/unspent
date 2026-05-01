import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Item not found:', itemError);
    return null;
  }

  // Get all votes for this item
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('wishlist_item_id', itemId);

  if (votesError) {
    console.log('Votes error:', votesError);
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
    console.log('Update error:', updateError);
  }

  // If pass or dupe, record savings
  if ((winner === 'pass' || winner === 'dupe') && item.price > 0) {
    await supabase.from('savings_tallies').insert({
      user_id: item.user_id,
      item_id: itemId,
      amount_saved: item.price,
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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    for (const item of expiredItems || []) {
      const result = await processVoteOutcome(supabase, item.id);
      if (result) {
        results.push({ itemId: item.id, ...result });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});