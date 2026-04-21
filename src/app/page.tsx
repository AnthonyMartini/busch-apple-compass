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
      <header style={{ marginBottom: '1rem' }}>
        <h1 style={{ 
          fontSize: '1.2rem', fontWeight: 900, letterSpacing: '4px', 
          textTransform: 'uppercase', color: 'var(--apple-red)', opacity: 0.8 
        }}>
          Bapple Compass
        </h1>
      </header>

      <div className="distance-hud">
        {distance && enabled ? (
          <>
            {(distance * 0.000621371).toFixed(1)}
            <span className="distance-unit">mi</span>
          </>
        ) : (
          '---'
        )}
      </div>

      <div className="compass-container" style={{ cursor: !enabled ? 'pointer' : 'default' }} onClick={!enabled ? requestPermissions : undefined}>
        {/* Permission Overlay inside Compass */}
        {!enabled && (
          <div style={{ 
            position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', 
            borderRadius: '50%', backdropFilter: 'blur(4px)' 
          }}>
            <p style={{ fontWeight: 900, letterSpacing: '2px', color: 'var(--apple-red)' }}>TAP TO</p>
            <p style={{ fontWeight: 900, letterSpacing: '2px' }}>CALIBRATE</p>
          </div>
        )}
        {/* Rotating Dial (Fully SVG for perfect positioning) */}
        <div 
          className="compass-dial" 
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320">
            {/* Cardinal Directions - Now all upright */}
            <text x="160" y="35" textAnchor="middle" fontSize="24" fontWeight="900" fill="white">N</text>
            <text x="285" y="165" textAnchor="middle" fontSize="20" fontWeight="900" fill="var(--apple-red)" opacity="0.6">E</text>
            <text x="160" y="295" textAnchor="middle" fontSize="20" fontWeight="900" fill="var(--apple-red)" opacity="0.6">S</text>
            <text x="35" y="165" textAnchor="middle" fontSize="20" fontWeight="900" fill="var(--apple-red)" opacity="0.6">W</text>

            {/* Subtle Degree Ticks */}
            {[...Array(40)].map((_, i) => (
              <line
                key={i}
                x1="160"
                y1="10"
                x2="160"
                y2="20"
                stroke="var(--apple-red)"
                strokeOpacity={i % 10 === 0 ? "0.6" : "0.2"}
                strokeWidth={i % 10 === 0 ? "2" : "1"}
                transform={`rotate(${i * 9}, 160, 160)`}
              />
            ))}
          </svg>
        </div>

        {/* Simplified Navigation Arrow (Points only to Store) */}
        <div 
          className="compass-needle" 
          style={{ transform: `rotate(${(relativeHeading || 0)}deg)` }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320">
            {/* Single Stealth Arrow - RED as requested */}
            <path 
              d="M160 40 L180 140 L160 130 L140 140 Z" 
              fill="var(--apple-red)"
              filter="drop-shadow(0 0 5px var(--apple-red-glow))"
            />
            {/* Center Core */}
            <circle cx="160" cy="160" r="3" fill="white" opacity="0.5" />
          </svg>
        </div>
      </div>

      {nearestRetailer && enabled ? (
        <div className="store-info">
          <div className="store-name">{nearestRetailer.name}</div>
          <div className="store-address">
            {nearestRetailer.address}, {nearestRetailer.city}
          </div>
        </div>
      ) : (
        <div className="store-info" style={{ opacity: 0.8 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div className="loading-spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }}></div>
              <span style={{ fontSize: '0.8rem' }}>Scanning for Busch Apple...</span>
            </div>
          ) : error && enabled ? (
            <div style={{ color: 'var(--apple-red)', fontSize: '0.8rem' }}>
              {error}
              <button onClick={() => window.location.reload()} style={{ display: 'block', margin: '0.5rem auto', background: 'transparent', border: '1px solid var(--apple-red)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem' }}>RETRY</button>
            </div>
          ) : (
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
              {enabled ? 'Awaiting location...' : 'Sensors locked'}
            </span>
          )}
        </div>
      )}

      {/* Manual Search (Hidden when active) */}
      {!nearestRetailer && enabled && (
        <div style={{ marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search Zip" 
            value={testZip}
            onChange={(e) => setTestZip(e.target.value)}
            style={{ 
              background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', 
              padding: '0.3rem', borderRadius: '4px', width: '100px', fontSize: '0.7rem' 
            }}
          />
          <button onClick={() => setManualZipCode(testZip)} style={{ fontSize: '0.7rem', marginLeft: '0.5rem', color: 'var(--apple-red)' }}>SEARCH</button>
        </div>
      )}

      <footer style={{ marginTop: 'auto', paddingBottom: '1rem', fontSize: '0.7rem', opacity: 0.3, letterSpacing: '1px' }}>
        BUSCH APPLE COMPASS v1.4
      </footer>
    </main>
  );
}
