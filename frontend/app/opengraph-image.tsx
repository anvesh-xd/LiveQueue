import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'LiveQueue — Skip the queue. Real-time song requests for nightclubs and venues.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          padding: 72,
          color: '#efe9dc',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Strobe wash */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: -100,
            width: 800,
            height: 800,
            background:
              'radial-gradient(circle at center, rgba(255,56,56,0.18) 0%, rgba(255,56,56,0) 60%)',
            display: 'flex',
          }}
        />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 14,
                height: 14,
                background: '#ff3838',
                borderRadius: 999,
                boxShadow: '0 0 30px rgba(255,56,56,0.6)',
                display: 'flex',
              }}
            />
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#efe9dc',
              }}
            >
              LiveQueue
            </div>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 18,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#a8a39a',
            }}
          >
            Est. tonight
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', marginBottom: 12 }}>
          <div
            style={{
              fontSize: 160,
              fontWeight: 400,
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              color: '#efe9dc',
              display: 'flex',
            }}
          >
            Skip
          </div>
          <div
            style={{
              fontSize: 160,
              fontStyle: 'italic',
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              color: '#efe9dc',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            the queue.
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontStyle: 'normal',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#ff3838',
                padding: '12px 18px',
                border: '2px solid #ff3838',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 14,
              }}
            >
              <div style={{ width: 10, height: 10, background: '#ff3838', borderRadius: 999, display: 'flex' }} />
              Live
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 28,
            borderTop: '1px solid rgba(239,233,220,0.16)',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: '#a8a39a',
              maxWidth: 760,
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            Real-time song requests for nightclubs · patrons request, DJs run the floor.
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 16,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6b6760',
              display: 'flex',
            }}
          >
            Next · Express · Socket.io
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
