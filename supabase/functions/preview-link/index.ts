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

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) return true;

  const ipv4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!ipv4) return false;

  const [a, b] = ipv4.slice(1).map(Number);
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0
  );
}

function parsePreviewUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (isBlockedHost(parsed.hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function requireUser(req: Request, supabase: ReturnType<typeof createClient>, serviceKey: string) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token || token === serviceKey) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Unspent/1.0 (https://unspent.app)',
      },
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Preview request failed with ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      throw new Error('Preview URL did not return HTML');
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > 1_000_000) {
      throw new Error('Preview response too large');
    }

    const html = (await response.text()).slice(0, 1_000_000);
    
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

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { url }: RequestBody = await req.json();
    
    if (!url) {
      return jsonResponse({ error: 'URL is required' }, 400);
    }

    const parsedUrl = parsePreviewUrl(url);
    if (!parsedUrl) {
      return jsonResponse({ error: 'Unsupported URL' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ error: 'Server misconfiguration' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const user = await requireUser(req, supabase, supabaseKey);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const ogData = await fetchOpenGraph(parsedUrl.toString());

    return jsonResponse(ogData);
  } catch (error) {
    console.error('Preview link error:', error);
    return jsonResponse({ error: 'Failed to fetch URL metadata' }, 500);
  }
});
