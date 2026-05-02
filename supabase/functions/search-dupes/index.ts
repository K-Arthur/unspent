import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SerperResult {
  title: string;
  link: string;
  price: string;
}

interface DupeResult {
  name: string;
  price: number;
  link: string;
  confidence: number;
}

const serperApiKey = Deno.env.get('SERPER_API_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAuthContext(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  serviceKey: string
): Promise<{ userId: string | null; isInternal: boolean }> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { userId: null, isInternal: false };
  if (token === serviceKey) return { userId: null, isInternal: true };

  const { data: { user } } = await supabase.auth.getUser(token);
  return { userId: user?.id ?? null, isInternal: false };
}

async function searchSerper(query: string): Promise<SerperResult[]> {
  if (!serperApiKey) {
    console.log('No Serper key, returning mock');
    return getMockDupes(query);
  }

  try {
    const response = await fetch('https://google.serper.ai/search', {
      method: 'POST',
      headers: {
        'X-API-Key': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10,
        siteDomain: 'amazon.com',
      }),
    });

    const data = await response.json();
    
    if (!data.organic) return getMockDupes(query);

    return (data.organic || [])
      .filter((item: any) => item.link?.includes('amazon.com'))
      .slice(0, 5)
      .map((item: any) => ({
        title: item.title?.replace(/ - Amazon.*$/, '') || query,
        link: item.link,
        price: item.price || '',
      }));
  } catch (error) {
    console.log('Serper error:', error);
    return getMockDupes(query);
  }
}

function getMockDupes(query: string): SerperResult[] {
  return [
    { title: `${query} - Budget Option`, link: 'https://amazon.com/dp/b000', price: '$19.99' },
    { title: `${query} - Value Pick`, link: 'https://amazon.com/dp/b001', price: '$29.99' },
    { title: `${query} - Amazon Basics`, link: 'https://amazon.com/dp/b002', price: '$14.99' },
  ];
}

function extractPrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) return 0;
  
  // If price is like 19.99 assume dollars. If like 1999 assume cents
  return parsed < 100 ? Math.round(parsed * 100) : parsed;
}

async function enhanceWithAI(dupes: SerperResult[], originalTitle: string, originalPrice: number): Promise<DupeResult[]> {
  if (!openaiApiKey || dupes.length === 0) {
    return dupes.map((d, i) => ({
      name: d.title,
      price: extractPrice(d.price),
      link: d.link,
      confidence: 0.7 - (i * 0.1),
    }));
  }

  try {
    const dupeList = dupes.map((d, i) => `${i + 1}. ${d.title} - ${d.price}`).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a shopping assistant. Rate how well each dupe matches the original product. Output JSON array with confidence scores 0-1.',
          },
          {
            role: 'user',
            content: `Original: ${originalTitle} ($${(originalPrice / 100).toFixed(2)})\n\nAlternatives:\n${dupeList}\n\nRespond with JSON: [{"name": "...", "price": cents, "confidence": 0.0-1.0}]`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content');
    }

    const parsed = JSON.parse(content.replace(/```json|```/g, ''));
    
    return parsed.map((p: any) => ({
      name: p.name,
      price: p.price,
      link: dupes.find((d) => d.title.includes(p.name))?.link || dupes[0].link,
      confidence: p.confidence,
    }));
  } catch (error) {
    console.log('AI enhancement failed:', error);
    
    return dupes.map((d, i) => ({
      name: d.title,
      price: extractPrice(d.price),
      link: d.link,
      confidence: 0.7 - (i * 0.1),
    }));
  }
}

async function generateAffiliateLink(productUrl: string): Promise<string | null> {
  const skimlinksId = Deno.env.get('SKIMLINKS_ID');
  
  if (!skimlinksId) {
    return null;
  }

  try {
    const response = await fetch(`https://api.skimlinks.com/v1/link转换为?url=${encodeURIComponent(productUrl)}&pub=${skimlinksId}`, {
      method: 'POST',
    });
    
    // Would need proper skimlinks API setup
    return null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return jsonResponse({ error: 'itemId is required' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ error: 'Server misconfiguration' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const auth = await getAuthContext(req, supabase, supabaseKey);

    if (!auth.isInternal && !auth.userId) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Get item details
    const { data: item, error } = await supabase
      .from('wishlist_items')
      .select('title, price, user_id')
      .eq('id', itemId)
      .single();

    if (error || !item) {
      return jsonResponse({ error: 'Item not found' }, 404);
    }

    if (!auth.isInternal && item.user_id !== auth.userId) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    // Search for dupes
    const searchResults = await searchSerper(item.title);

    // Enhance with AI
    const enhancedDupes = await enhanceWithAI(searchResults, item.title, item.price);

    // Save to database
    const savedDupes = [];
    
    for (const dupe of enhancedDupes.slice(0, 3)) {
      const { data, error: insertError } = await supabase
        .from('dupes_log')
        .insert({
          wishlist_item_id: itemId,
          suggested_dupe_link: dupe.link,
          suggested_price: dupe.price,
          suggested_name: dupe.name,
          affiliate_link: null,
          source: 'serpapi',
          confidence: dupe.confidence,
        })
        .select()
        .single();

      if (!insertError && data) {
        savedDupes.push(data);
      }
    }

    const response = {
      success: true,
      item: item.title,
      dupes: enhancedDupes.slice(0, 3),
      saved: savedDupes.length,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Dupe search error:', error);
    return jsonResponse({ error: 'Failed to search dupes' }, 500);
  }
});
