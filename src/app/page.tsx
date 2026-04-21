'use client';

import { useState } from 'react';
import { useCompass } from '@/hooks/useCompass';

export default function Home() {
  const { 
    nearestRetailer, loading, error, distance, heading, relativeHeading, 
    setManualZipCode, enabled, setEnabled 
  } = useCompass();
  const [testZip, setTestZip] = useState('');

  const requestPermissions = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setEnabled(true);
        }
      } catch (err) {
        console.error('Permission request failed:', err);
      }
    } else {
      // Non-iOS or already granted
      setEnabled(true);
    }
  };

  return (
    <main className="hud-container">
      <div className="title-header">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          {/* Branded Icon - Centered */}
          <img 
            src="/icon.png" 
            alt="Bapple Icon" 
            width={64} 
            height={64} 
            style={{ borderRadius: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} 
          />
        </div>
        <h1 className="main-title">Bapple Compass</h1>
      </div>

      <div className="compass-container" style={{ cursor: !enabled ? 'pointer' : 'default' }} onClick={!enabled ? requestPermissions : undefined}>
        {/* Permission Overlay inside Compass - Styled as a clean 'Start' state */}
        {!enabled && (
          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.4)', 
            borderRadius: '50%', backdropFilter: 'blur(8px)' 
          }}>
            <button className="btn-pill">
              Calibrate & Start <span>&rarr;</span>
            </button>
          </div>
        )}
        
        {/* Rotating Dial (Fully SVG for perfect positioning) */}
        <div 
          className="compass-dial" 
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <svg width="340" height="340" viewBox="0 0 340 340">
            {/* Cardinal Directions - High Contrast for Light Mode */}
            <text x="170" y="32" textAnchor="middle" fontSize="24" fontWeight="900" fill="#000">N</text>
            <text x="305" y="178" textAnchor="middle" fontSize="20" fontWeight="900" fill="#000" opacity="0.2">E</text>
            <text x="170" y="318" textAnchor="middle" fontSize="20" fontWeight="900" fill="#000" opacity="0.2">S</text>
            <text x="35" y="178" textAnchor="middle" fontSize="20" fontWeight="900" fill="#000" opacity="0.2">W</text>

            {/* Subtle Ticks */}
            {[...Array(60)].map((_, i) => (
              <line
                key={i}
                x1="170"
                y1="10"
                x2="170"
                y2="18"
                stroke="#000"
                strokeOpacity={i % 15 === 0 ? "0.3" : "0.1"}
                strokeWidth={i % 15 === 0 ? "2" : "1"}
                transform={`rotate(${i * 6}, 170, 170)`}
              />
            ))}
          </svg>
        </div>

        {/* Navigation Arrow */}
        <div 
          className="compass-needle" 
          style={{ transform: `rotate(${(relativeHeading || 0)}deg)` }}
        >
          <svg width="340" height="340" viewBox="0 0 340 340">
            <path 
              d="M170 40 L195 170 L170 155 L145 170 Z" 
              fill="var(--apple-red)"
            />
            <circle cx="170" cy="170" r="4" fill="#000" />
          </svg>
        </div>
      </div>

      <div className="distance-hud">
        {distance && enabled ? (
          <>
            {(distance * 0.000621371).toFixed(1)}
            <span className="distance-unit">mi</span>
          </>
        ) : (
          <span style={{ opacity: 0.1 }}>---</span>
        )}
      </div>

      {nearestRetailer && enabled ? (
        <div className="store-info" style={{ borderTop: '1px solid #eee', paddingTop: '2rem', width: '100%' }}>
          <div className="store-name" style={{ color: '#000', fontSize: '1.2rem', fontWeight: 700 }}>{nearestRetailer.name}</div>
          <div className="store-address" style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
            {nearestRetailer.address}, {nearestRetailer.city}
          </div>
        </div>
      ) : (
        <div className="store-info" style={{ opacity: 0.8 }}>
          {loading ? (
            <div style={{ color: '#888', fontSize: '0.9rem' }}>Scanning region...</div>
          ) : (
            <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
              {enabled ? 'Awaiting target...' : 'Sensors locked'}
            </span>
          )}
        </div>
      )}

      {/* Manual Search (Hidden when active) */}
      {!nearestRetailer && enabled && (
        <div style={{ marginTop: '1rem', background: '#f9f9f9', padding: '0.5rem', borderRadius: '50px', border: '1px solid #eee' }}>
          <input 
            type="text" 
            placeholder="Search Zip" 
            value={testZip}
            onChange={(e) => setTestZip(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: '#000', outline: 'none',
              padding: '0 1rem', width: '100px', fontSize: '0.8rem' 
            }}
          />
          <button onClick={() => setManualZipCode(testZip)} style={{ fontSize: '0.8rem', marginRight: '0.5rem', fontWeight: 600 }}>GO</button>
        </div>
      )}

      <footer style={{ marginTop: 'auto', padding: '2rem 0', fontSize: '0.7rem', opacity: 0.2, fontWeight: 500 }}>
        BAPPLE COMPASS v2.0 &bull; ANTHONY MARTINI
      </footer>
    </main>
  );
}
