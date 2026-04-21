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
  const [persistentLoading, setPersistentLoading] = useState(false);

  // Ensure loading animation finishes even if API finishes early.
  useEffect(() => {
    if (loading) {
      const timer = window.setTimeout(() => setPersistentLoading(true), 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setPersistentLoading(false), 1000);
    return () => window.clearTimeout(timer);
  }, [loading]);

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
          className={`compass-container ${loading ? 'is-loading' : ''}`}
          type="button"
          onClick={!enabled ? requestPermissions : undefined}
          disabled={enabled}
          aria-label={
            enabled
              ? 'Compass active'
              : 'Enable motion and location access to start the compass'
          }
        >
          {persistentLoading && <div className="compass-loading-overlay" />}

          {!enabled && (
            <div className="permission-overlay">
              <span className="btn-pill">
                Start <span>&rarr;</span>
              </span>
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
            </svg>
          </div>

          <div
            className="compass-needle"
            style={{ transform: `rotate(${relativeHeading ?? 0}deg)` }}
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
              <>
                {(distance * 0.000621371).toFixed(1)}
                <span className="distance-unit">mi</span>
              </>
            ) : (
              <span className="distance-placeholder">---</span>
            )}
          </div>
          <p className="status-copy">
            {error
              ? error
              : loading && persistentLoading
                ? 'Scanning your region for Busch Apple.'
                : enabled
                  ? ''
                  : 'Tap the compass to begin.'}
          </p>
        </div>

        <div className="store-info">
          {nearestRetailer && enabled && (
            <article
              className={`location-card ${!persistentLoading ? 'is-visible' : ''}`}
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
