import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #E8B4B8 0%, #A8C5A8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 40,
            margin: 24,
          }}
        >
          <span style={{ fontSize: 64 }}>🎉</span>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#2D2D2D',
              marginTop: 16,
            }}
          >
            I Saved Money!
          </h1>
          <p
            style={{
              fontSize: 24,
              color: '#6B6B6B',
              marginTop: 8,
            }}
          >
            Using Unspent to make smarter purchases
          </p>
          <p
            style={{
              fontSize: 18,
              color: '#6B6B6B',
              marginTop: 24,
            }}
          >
            Download at unspent.app
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}