'use client';

import { useEffect, useState } from 'react';
import { useCompass } from '@/hooks/useCompass';

export default function Home() {
  const {
    nearestRetailer,
    loading,
    error,
    distance,
    heading,
    relativeHeading,
    enabled,
    setEnabled,
  } = useCompass();
  const [showPulse, setShowPulse] = useState(false);
  const [hasShownPulse, setHasShownPulse] = useState(false);

  useEffect(() => {
    if (nearestRetailer && !hasShownPulse) {
      setShowPulse(true);
      const timer = window.setTimeout(() => {
        setShowPulse(false);
        setHasShownPulse(true);
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [nearestRetailer, hasShownPulse]);

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
      return;
    }

    setEnabled(true);
  };

  return (
    <main className="hud-container">
      <div className="mountain-background" />

      <section className="app-shell" aria-label="Nearest Busch Apple compass">
        <header className="title-header">
          <h1 className="main-title">Bapple Compass</h1>
          <p className="main-subtitle">
            Points you to your heart&apos;s deepest desire
            <br />
            (nearest bapple retailer)
          </p>
        </header>

        <button
          className={`compass-container ${enabled && !nearestRetailer ? 'is-loading' : ''}`}
          type="button"
          onClick={!enabled ? requestPermissions : undefined}
          disabled={enabled}
          aria-label={
            enabled
              ? 'Compass active'
              : 'Enable motion and location access to start the compass'
          }
        >
          {showPulse && <div className="compass-loading-overlay" />}

          {enabled && !nearestRetailer && !error && (
            <div className="gray-pulses">
              <div className="gray-pulse-ring" />
              <div className="gray-pulse-ring" />
              <div className="gray-pulse-ring" />
            </div>
          )}

          {(!enabled || !nearestRetailer || error) && (
            <div className="state-overlay">
              {error ? "No Bapple Here" : (!enabled ? "Tap to Begin" : "Loading...")}
            </div>
          )}

          <div
            className="compass-dial"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <svg width="100%" height="100%" viewBox="0 0 340 340" aria-hidden="true">
              <text
                x="170"
                y="32"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill="#111111"
              >
                N
              </text>
              <text
                x="305"
                y="178"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                E
              </text>
              <text
                x="170"
                y="318"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                S
              </text>
              <text
                x="35"
                y="178"
                textAnchor="middle"
                fontSize="20"
                fontWeight="900"
                fill="#111111"
                opacity="0.2"
              >
                W
              </text>

              <g className={`reveal-item-svg ${hasShownPulse ? 'is-visible' : ''}`} style={{ transitionDelay: '0s' }}>
                {[...Array(60)].map((_, i) => (
                  <line
                    key={i}
                    x1="170"
                    y1="10"
                    x2="170"
                    y2="18"
                    stroke="#111111"
                    strokeOpacity={i % 15 === 0 ? '0.3' : '0.1'}
                    strokeWidth={i % 15 === 0 ? '2' : '1'}
                    transform={`rotate(${i * 6}, 170, 170)`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div
            className="compass-needle"
            style={{ transform: `rotate(${hasShownPulse ? (relativeHeading ?? 0) : 0}deg)` }}
          >
            <svg width="100%" height="100%" viewBox="0 0 340 340" aria-hidden="true">
              <path
                d="M170,20 L185,150 L170,140 L155,150 Z"
                fill="var(--apple-red)"
                style={{
                  filter: 'drop-shadow(0 4px 10px rgba(255, 59, 48, 0.4))',
                }}
              />
            </svg>
          </div>
        </button>

        <div className="distance-panel" aria-live="polite">
          <div className="distance-hud">
            {distance && enabled ? (
              <div className={`reveal-item ${hasShownPulse ? 'is-visible' : ''}`} style={{ transitionDelay: '0.15s' }}>
                {(distance * 0.000621371).toFixed(1)}
                <span className="distance-unit">mi</span>
              </div>
            ) : (
              <span className="distance-placeholder">---</span>
            )}
          </div>
          <p className="status-copy">
            {error
              ? error
              : enabled && !nearestRetailer
                ? 'Scanning your region for Busch Apple.'
                : showPulse 
                  ? 'Found target...'
                  : enabled
                    ? ''
                    : 'Tap the compass to begin.'}
          </p>
        </div>

        <div className="store-info">
          {nearestRetailer && enabled && (
            <article
              className={`location-card ${hasShownPulse ? 'is-visible' : ''}`}
              style={{ transitionDelay: '0.3s' }}
            >
              <p className="card-label">Closest retailer</p>
              <div className="store-name">{nearestRetailer.name}</div>
              <div className="store-address">
                {nearestRetailer.address}, {nearestRetailer.city},{' '}
                {nearestRetailer.state} {nearestRetailer.zipCode}
              </div>
            </article>
          )}
        </div>

        <footer className="app-footer">
          BAPPLE COMPASS v1.0 | ANTHONY MARTINI
        </footer>
      </section>
    </main>
  );
}
