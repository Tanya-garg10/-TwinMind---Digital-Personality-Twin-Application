import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#0f0f23',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Left half — blue to cyan */}
                    <div style={{
                        width: 11,
                        height: 18,
                        borderRadius: '10px 3px 3px 10px',
                        background: 'linear-gradient(180deg, #3b5bdb 0%, #00d9ff 100%)',
                    }} />
                    {/* Right half — purple to violet */}
                    <div style={{
                        width: 11,
                        height: 18,
                        borderRadius: '3px 10px 10px 3px',
                        background: 'linear-gradient(180deg, #7c3aed 0%, #a78bfa 100%)',
                    }} />
                </div>
            </div>
        ),
        { ...size }
    );
}
