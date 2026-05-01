import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Image, loadFont, registerFont } from 'https://deno.land/x/satori@0.10.9/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fontUrl = 'https://github.com/googlefonts/inter/raw/main/fonts/Inter-Regular.ttf';

async function generateShareCard(
  itemName: string,
  amountSaved: number,
  username: string,
  template: string = 'default'
): Promise<Uint8Array> {
  const primary = '#E8B4B8';
  const secondary = '#A8C5A8';
  const text = '#2D2D2D';
  const surface = '#FFFFFF';

  const templateConfigs = {
    default: {
      background: [232, 180, 184],
      accent: primary,
    },
    celebration: {
      background: [168, 197, 168],
      accent: secondary,
    },
    bold: {
      background: [245, 230, 211],
      accent: '#2D2D2D',
    },
  };

  const config = templateConfigs[template as keyof typeof templateConfigs] || templateConfigs.default;

  // Using SVG generation for simplicity (would use Satori in production with proper font loading)
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.background[0] === 232 ? primary : config.background[0] === 168 ? secondary : '#F5E6D3'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${config.background[0] === 232 ? secondary : '#E8B4B8'};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="${surface}"/>
      <text x="600" y="160" font-family="system-ui" font-size="48" font-weight="bold" fill="${text}" text-anchor="middle">I didn't buy it!</text>
      <text x="600" y="240" font-family="system-ui" font-size="32" fill="${text}" text-anchor="middle">${itemName}</text>
      <text x="600" y="320" font-family="system-ui" font-size="64" font-weight="bold" fill="${config.accent}" text-anchor="middle">$${(amountSaved / 100).toFixed(2)} saved</text>
      <text x="600" y="400" font-family="system-ui" font-size="20" fill="#6B6B6B" text-anchor="middle">From @${username} via Unspent</text>
      <text x="600" y="500" font-family="system-ui" font-size="18" fill="#6B6B6B" text-anchor="middle">unspent.app/download</text>
    </svg>
  `;

  // Convert SVG to PNG using a simple canvas approach (simplified for demo)
  const encoder = new TextEncoder();
  const svgBytes = encoder.encode(svg);

  return svgBytes; // Would convert to PNG in production
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { itemId, template } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get item and user details
    const { data: item, error: itemError } = await supabase
      .from('wishlist_items')
      .select('title, price, user_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({ error: 'Item not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', item.user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBytes = await generateShareCard(
      item.title,
      item.price,
      profile.username,
      template
    );

    return new Response(imageBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="unspent-share-${itemId}.svg"`,
      },
    });
  } catch (error) {
    console.log('Share card error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate share card' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});