import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  url: string;
}

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  price?: number;
}

async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Unspent/1.0 (https://unspent.app)',
      },
    });
    const html = await response.text();
    
    const title = extractMeta(html, 'og:title') || extractMeta(html, 'title') || 'Wishlist Item';
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
    const image = extractMeta(html, 'og:image') || '';
    const priceStr = extractMeta(html, 'product:price:amount') || '';
    const price = priceStr ? Math.round(parseFloat(priceStr) * 100) : undefined;
    
    return { title, description, image, price };
  } catch (error) {
    return { title: 'Wishlist Item', description: '', image: '' };
  }
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta property="${property}" content="([^"]+)"`, 'i'),
    new RegExp(`<meta name="${property}" content="([^"]+)"`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url }: RequestBody = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ogData = await fetchOpenGraph(url);

    return new Response(
      JSON.stringify(ogData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch URL metadata' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});