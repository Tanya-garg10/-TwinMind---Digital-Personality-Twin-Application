import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TwinMind — Digital Personality Twin';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 1200,
                    height: 630,
                    background: '#0f0f23',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background glow blobs */}
                <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #3b5bdb44 0%, transparent 70%)', display: 'flex' }} />
                <div style={{ position: 'absolute', bottom: -120, right: -80, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed33 0%, transparent 70%)', display: 'flex' }} />
                <div style={{ position: 'absolute', top: 80, right: 100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #00d9ff22 0%, transparent 70%)', display: 'flex' }} />

                {/* Twin brain logo */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                    <div style={{ width: 48, height: 72, borderRadius: '36px 8px 8px 36px', background: 'linear-gradient(180deg, #3b5bdb 0%, #00d9ff 100%)' }} />
                    <div style={{ width: 48, height: 72, borderRadius: '8px 36px 36px 8px', background: 'linear-gradient(180deg, #7c3aed 0%, #a78bfa 100%)' }} />
                </div>

                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
                    <span style={{ fontSize: 72, fontWeight: 800, background: 'linear-gradient(90deg, #00d9ff, #a78bfa)', backgroundClip: 'text', color: 'transparent' }}>
                        TwinMind
                    </span>
                </div>

                {/* Tagline */}
                <div style={{ fontSize: 28, color: '#b0b9d4', marginBottom: 48, letterSpacing: 1 }}>
                    Discover Your Digital Personality Twin
                </div>

                {/* Feature pills */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {['🧠 Personality Quiz', '📊 Trait Analysis', '🔮 Decision Prediction', '💬 Twin Chat'].map(f => (
                        <div key={f} style={{ padding: '10px 22px', borderRadius: 999, border: '1px solid #252552', background: '#16213e', color: '#b0b9d4', fontSize: 18 }}>
                            {f}
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, background: 'linear-gradient(90deg, #3b5bdb, #00d9ff, #7c3aed, #a78bfa)', display: 'flex' }} />
            </div>
        ),
        { ...size }
    );
}
