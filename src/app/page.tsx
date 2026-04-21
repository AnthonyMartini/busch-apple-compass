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
      {/* Faceted Busch-style Mountains - Centered Background */}
      <div className="mountain-background">
        <svg width="100%" height="400" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet">
          {/* Shadow Facets (Right side of peaks - Darker) */}
          <path 
            d="M600,60 L750,200 L600,200 Z M300,100 L420,200 L300,200 Z M900,90 L1080,200 L900,200 Z" 
            fill="#000" 
            opacity="0.12"
          />
          {/* Lit Facets (Left side of peaks - Lighter) */}
          <path 
            d="M600,60 L450,200 L600,200 Z M300,100 L180,200 L300,200 Z M900,90 L720,200 L900,200 Z" 
            fill="#000" 
            opacity="0.04"
          />
        </svg>
      </div>

      <div className="title-header">
        <h1 className="main-title">Bapple Compass</h1>
      </div>

      <div className={`compass-container ${loading ? 'is-loading' : ''}`} style={{ cursor: !enabled ? 'pointer' : 'default' }} onClick={!enabled ? requestPermissions : undefined}>
        {/* Radar Loading Scan */}
        {loading && <div className="compass-loading-overlay" />}

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

      <div className="store-info">
        {nearestRetailer && enabled ? (
          <>
            <div className="store-name">{nearestRetailer.name}</div>
            <div className="store-address">
              {nearestRetailer.address}, {nearestRetailer.city}
            </div>
          </>
        ) : (
          loading && <div style={{ color: '#888', fontSize: '0.9rem' }}>Scanning region...</div>
        )}
      </div>

      <footer style={{ marginTop: 'auto', padding: '2rem 0', fontSize: '0.7rem', opacity: 0.2, fontWeight: 500 }}>
        BAPPLE COMPASS v2.1 &bull; ANTHONY MARTINI
      </footer>
    </main>
  );
}
